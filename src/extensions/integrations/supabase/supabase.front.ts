import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getValue } from '@/_common/helpers/code/customCode.js';

import { SupabaseQueryBuilder } from './utils/supabaseQueryBuilder';
import type { SupabaseTableConfig, SupabaseViewConfig } from './supabase.types';

function formatSession(session) {
    const _session = { ...session };
    delete _session.user;
    return _session;
}

export default {
    connection: {
        init: async ({ connection }) => {
            if (!connection) throw new Error('Supabase connection is required');

            const client = createClient(
                connection.config.customDomain ||
                    `https://${connection.config.branchRef || connection.config.projectRef}.supabase.co`,
                connection.config.publishableKey
            );

            const backAuthStore = wwLib.store.backAuth;
            client.auth.onAuthStateChange(async (event, session) => {
                if (backAuthStore.connectionId !== connection.id) return;
                switch (event) {
                    case 'INITIAL_SESSION':
                        return;
                    case 'SIGNED_OUT':
                        backAuthStore.clearAuthSession();
                        return;
                    case 'USER_UPDATED':
                        backAuthStore.setAuthUser(session.user);
                        return;
                    case 'SIGNED_IN':
                    case 'TOKEN_REFRESHED':
                        if (session?.access_token === backAuthStore.session?.access_token) return;
                        await backAuthStore.setAuthSession(formatSession(session), { persist: true });
                        backAuthStore.setAuthUser(session.user);
                        return;
                }
            });

            return client;
        },
    },
    async loadView({
        tableConfig,
        viewConfig = {},
        parameters = {},
        instance,
    }: {
        tableConfig: SupabaseTableConfig;
        viewConfig?: SupabaseViewConfig;
        parameters?: Record<string, unknown>;
        instance: SupabaseClient;
    }) {
        if (!instance) throw new Error('Supabase instance is required');
        if (!tableConfig?.table) throw new Error('Table name is required');
        const processedViewConfig = getValue(viewConfig, { parameters }) as SupabaseViewConfig;
        const parameterOffset = typeof parameters?.offset === 'number' ? parameters.offset : undefined;
        const parameterLimit = typeof parameters?.limit === 'number' ? parameters.limit : undefined;

        processedViewConfig.offset = parameterOffset ?? processedViewConfig.offset ?? 0;
        processedViewConfig.limit = parameterLimit ?? processedViewConfig.limit;

        const queryBuilder = new SupabaseQueryBuilder(processedViewConfig);
        let query = instance
            .from(tableConfig.table)
            .select(queryBuilder.selectString, { count: processedViewConfig.count ?? 'exact' });

        query = queryBuilder.applyFilters(query);
        query = queryBuilder.applySort(query);
        query = queryBuilder.applyTableViewPagination(query);
        const { data, error, count } = await query;
        const nextOffset = processedViewConfig.offset + (data?.length || 0);

        if (error) throw error;
        return {
            data: data || [],
            metadata: {
                limit: processedViewConfig.limit || null,
                offset: processedViewConfig.offset,
                nextOffset: nextOffset >= count ? null : nextOffset,
                total: count || null,
            },
        };
    },
    hooks: {
        'auth-refresh': async ({ session, instance }: { session?: any; instance?: SupabaseClient } = {}) => {
            if (!instance) throw new Error('Supabase instance is required');
            const backAuthStore = wwLib.store.backAuth;
            if (!session) {
                const { data } = await instance.auth.getSession();
                backAuthStore.setAuthSession(formatSession(data.session), { persist: true });
            }
            const { data } = await instance.auth.getUser();
            backAuthStore.setAuthUser(data.user);
        },
    },
    actions: {
        select: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const queryBuilder = new SupabaseQueryBuilder(args);
            let query = instance
                .from(args.table)
                .select(queryBuilder.selectString, args.count ? { count: args.count } : {});

            query = queryBuilder.applyFilters(query);
            query = queryBuilder.applySort(query);
            query = queryBuilder.applyActionPagination(query);
            const resultQuery = queryBuilder.applySingleResult(query);

            const { data, error, count } = await resultQuery;
            if (error) throw error;
            return args.count ? { data, count } : data;
        },
        insert: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const selectColumns = (args.returnColumns || []).join(',') || '*';
            const builder = instance.from(args.table).insert(args.data);
            const { data, error } = await (args.returnMode === 'none' ? builder : builder.select(selectColumns));

            if (error) throw error;
            return data;
        },
        update: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const selectColumns = (args.returnColumns || []).join(',') || '*';
            let query = instance.from(args.table).update(args.data);
            query = new SupabaseQueryBuilder(args).applyFilters(query);
            const { data, error, count } = await (args.returnMode === 'none' ? query : query.select(selectColumns));

            if (error) throw error;
            return args.count ? { data, count } : data;
        },
        upsert: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const selectColumns = (args.returnColumns || []).join(',') || '*';
            const builder = instance.from(args.table).upsert(args.data, {
                onConflict: args.onConflict?.join(','),
                ignoreDuplicates: args.ignoreDuplicates,
            });
            const { data, error } = await (args.returnMode === 'none' ? builder : builder.select(selectColumns));

            if (error) throw error;
            return data;
        },
        delete: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const selectColumns = (args.returnColumns || []).join(',') || '*';
            let query = instance.from(args.table).delete();
            query = new SupabaseQueryBuilder(args).applyFilters(query);
            const { data, error } = await (args.returnMode === 'none' ? query : query.select(selectColumns));

            if (error) throw error;
            return data;
        },
        'storage-list': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).list(args.path, {
                limit: args.limit,
                offset: args.offset,
                search: args.search,
                sortBy: args.sortBy,
            });

            if (error) throw error;
            return data;
        },
        'storage-upload': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).upload(args.path, args.fileBody, {
                upsert: args.upsert,
                contentType: args.contentType,
                cacheControl: args.cacheControl,
            });

            if (error) throw error;
            return data;
        },
        'storage-remove': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).remove(args.paths);

            if (error) throw error;
            return data;
        },
        'storage-create-signed-url': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).createSignedUrl(args.path, args.expiresIn);

            if (error) throw error;
            return data;
        },
        'storage-get-public-url': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data } = instance.storage.from(args.id).getPublicUrl(args.path, {
                download: args.download,
                transform: args.transform,
            });

            return data;
        },
        'storage-copy': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');
            const { data, error } = await instance.storage.from(args.id).copy(args.fromPath, args.toPath);

            if (error) throw error;
            return data;
        },
        'storage-move': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).move(args.fromPath, args.toPath);

            if (error) throw error;
            return data;
        },
        'storage-update': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).update(args.path, args.fileBody, {
                contentType: args.contentType,
                cacheControl: args.cacheControl,
            });

            if (error) throw error;
            return data;
        },
        'storage-download': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.storage.from(args.id).download(args.path);

            if (error) throw error;
            return data;
        },
        rpc: async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            let query = instance.rpc(args.fn, args.params);
            if (args.single) query = query.single() as any;
            const { data, error } = await query;

            if (error) throw error;
            return data;
        },
        'functions-invoke': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.functions.invoke(args.functionName, {
                method: args.method,
                body: args.body,
                headers: args.headers,
            });

            if (error) throw error;
            return data;
        },
        // Auth actions
        'auth-sign-in-with-password': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.signInWithPassword({
                email: args.email,
                password: args.password,
                options: args.options,
            });

            if (error) throw error;
            return data;
        },
        'auth-sign-up': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.signUp({
                email: args.email,
                password: args.password,
                options: args.options,
            });

            if (error) throw error;
            return data;
        },
        'auth-get-user': async (_, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.getUser();

            if (error) throw error;
            return data;
        },
        'auth-sign-in-with-oauth': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.signInWithOAuth({
                provider: args.provider,
                options: args.options,
            });

            if (error) throw error;
            return data;
        },
        'auth-refresh-session': async (_, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.refreshSession();

            if (error) throw error;
            return data;
        },
        'auth-sign-out': async (_, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { error } = await instance.auth.signOut();

            if (error) throw error;
        },
        'auth-sign-in-with-otp': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.signInWithOtp({
                email: args.email,
                options: args.options,
            });

            if (error) throw error;
            return data;
        },
        'auth-verify-otp': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.verifyOtp({
                email: args.email,
                token: args.token,
                type: args.type,
                options: args.options,
            });

            if (error) throw error;
            return data;
        },
        'auth-reset-password-for-email': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.resetPasswordForEmail(args.email, {
                redirectTo: args.redirectTo,
                captchaToken: args.captchaToken,
            });

            if (error) throw error;
            return data;
        },
        'auth-update-user': async ({ args }, { instance }: { instance: SupabaseClient }) => {
            if (!instance) throw new Error('Supabase instance is required');

            const { data, error } = await instance.auth.updateUser({
                email: args.email,
                password: args.password,
                current_password: args.currentPassword,
                data: args.data,
            });

            if (error) throw error;
            return data;
        },
    },
};
