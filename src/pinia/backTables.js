import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
 
// A table of the project's own schema is named as is; one WeWeb manages (auth, agents) as schema.name.
export const tableKeyOf = (table, schema) => (schema && schema !== 'public' ? `${schema}.${table}` : table);

export const useBackTablesStore = defineStore('backTables', () => {
    const integrationsStore = wwLib.store.integrations;
    const tables = reactive({
        editor: {},
        staging: {},
        production: {},
    });
    // Read-only tables WeWeb manages, keyed by schema.name: kept apart so they never reach the write actions.
    const nativeTables = reactive({
        editor: {},
        staging: {},
        production: {},
    });
    const integrationTables = reactive({});
    const isLoading = reactive({
        editor: true,
        staging: true,
        production: true,
    });

    /* wwFront:start */
    // eslint-disable-next-line no-undef
    Object.assign(integrationTables, {"f1a357d9-eba7-40b1-97ac-16a8f5a8aa13":{"id":"f1a357d9-eba7-40b1-97ac-16a8f5a8aa13","name":"SkinScan – Produktanbefalinger","description":"Supabase skin_recommendations; personlige data beskyttet av RLS, krever Supabase Auth før bruk.","integration":"supabase","config":{"table":"skin_recommendations"},"connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","type":"front"},"88fc6b00-f97b-4501-ade8-4a41f35f1e12":{"id":"88fc6b00-f97b-4501-ade8-4a41f35f1e12","name":"SkinScan – Hudpleieprodukter","description":"Produktkatalog fra Supabase skin_products. Ingen personlige huddata; kun klargjøring av integrasjon.","integration":"supabase","config":{"table":"skin_products"},"connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","type":"front"},"0ecd2be3-20f4-4aac-a24e-133f14ba701e":{"id":"0ecd2be3-20f4-4aac-a24e-133f14ba701e","name":"SkinScan – Hudprofiler","description":"Supabase skin_profiles; personlige data beskyttet av RLS, krever Supabase Auth før bruk.","integration":"supabase","config":{"table":"skin_profiles"},"connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","type":"front"},"84e29000-8ded-412a-afa8-d36553571d7b":{"id":"84e29000-8ded-412a-afa8-d36553571d7b","name":"SkinScan – Hudanalyser","description":"Supabase skin_analyses; personlige data beskyttet av RLS, krever Supabase Auth før bruk.","integration":"supabase","config":{"table":"skin_analyses"},"connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","type":"front"},"711c5dce-d718-4a6e-af8d-a68dacc4d1f6":{"id":"711c5dce-d718-4a6e-af8d-a68dacc4d1f6","name":"SkinScan – Samtykker","description":"Supabase skin_consents; personlige data beskyttet av RLS, krever Supabase Auth før bruk.","integration":"supabase","config":{"table":"skin_consents"},"connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","type":"front"}});
    /* wwFront:end */

    const setTablesState = (env, data = []) => {
        if (!tables[env]) return;
        tables[env] = data.reduce((acc, table) => {
            acc[table.name] = table;
            return acc;
        }, {});
    };

    let loadTables = async () => {};

 
    const isIntegrationTable = tableIdentifier => {
        return tableIdentifier && tableIdentifier.includes('/');
    };

    const getTableInfo = tableIdentifier => {
        if (isIntegrationTable(tableIdentifier)) {
            const [integration, id] = tableIdentifier.split('/');
            const table = integrationTables[id];
            if (!table) return null;

            return {
                id: table.id,
                name: table.name,
                integration,
                connectionId: table.connectionId,
                config: table.config,
                icon: integrations?.[integration]?.icon || `logos/${integration}`,
                rawTable: table,
            };
        }

        const nativeTable = nativeTables.editor[tableIdentifier];
        if (nativeTable) {
            return {
                id: tableIdentifier,
                name: nativeTable.name,
                schema: nativeTable.schema,
                integration: null,
                connectionId: null,
                config: null,
                icon: 'logos/weweb',
                rawTable: nativeTable,
            };
        }

        const table = tables.editor[tableIdentifier];
        if (!table) return null;

        return {
            id: tableIdentifier,
            name: tableIdentifier,
            integration: null,
            connectionId: null,
            config: null,
            icon: 'logos/weweb',
            rawTable: table,
        };
    };

    const getTableColumns = tableIdentifier => {
        const tableInfo = getTableInfo(tableIdentifier);
        if (!tableInfo) return [];

        if (tableInfo.integration) {
            // eslint-disable-next-line no-useless-assignment -- Used when the wwEditor block is stripped from the front build.
            let renderedColumns = [];
             return renderedColumns;
        }

        const physicalColumns = (tableInfo.rawTable.columns || [])
            .filter(column => tableInfo.schema || !column.isSystem)
            .map(column => ({
                id: column.name,
                name: column.name,
                type: column.type,
                label: column.name,
                isRequired: column.isRequired,
                defaultValue: column.defaultValue,
                isSystem: column.isSystem || false,
                isIntegration: false,
                linkedColumn: column.linkedColumn,
            }));
        const formulaColumns = backTableFormulaColumnsStore.getByTable(tableIdentifier).map(column => ({
            id: column.id,
            name: column.name,
            type: 'text',
            label: column.name,
            isRequired: false,
            isIntegration: false,
            isFormulaColumn: true,
            isComputed: true,
            isReadOnly: true,
            formula: column.formula,
        }));

        return [...physicalColumns, ...formulaColumns];
    };

    const getTableOptions = () => {
        const nativeOptions = Object.values(tables.editor).map(table => ({
            label: table.name,
            value: table.name,
            icon: 'logos/weweb',
            isIntegration: false,
        }));

        const integrationOptions = Object.values(integrationTables).map(table => ({
            label: table.name,
            value: `${table.integration}/${table.id}`,
            icon: integrations?.[table.integration]?.icon || `logos/${table.integration}`,
            isIntegration: true,
        }));

        return [...nativeOptions, ...integrationOptions];
    };

    // What a view reads: an integration table by its id, a table WeWeb manages as schema.name, a project table by name.
    const getViewTableKey = tableView =>
        tableView?.tableId || tableKeyOf(tableView?.config?.table, tableView?.config?.schema);
    const getViewTable = tableView => {
        if (tableView?.tableId) return integrationTables[tableView.tableId] || null;
        const key = getViewTableKey(tableView);
        return tables.editor[key] || nativeTables.editor[key] || null;
    };

    const assertWritable = tableName => {
        if (nativeTables.editor[tableName]) throw new Error('This table is managed by WeWeb and is read only.');
    };

    return {
        tables,
        nativeTables,
        integrationTables,
        isLoading,
        addIntegrationTable(table) {
            if (!table?.id) return;
            integrationTables[table.id] = table;
        },
        async refreshTables(env) {
            await loadTables(env);
        },
         isIntegrationTable,
        getViewTableKey,
        getViewTable,
        getTableInfo,
        getTableColumns,
        getTableOptions,
    };
});
