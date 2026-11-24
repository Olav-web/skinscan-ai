import { describe, expect, it, vi } from 'vitest';
import { SupabaseQueryBuilder } from './supabaseQueryBuilder';

describe('Supabase table-view foreign key references', () => {
    it('disambiguates existing saved references to the same table without changing response names', () => {
        const columns = {
            id: true,
            created_by__users: { $relation: 'users', $alias: 'users', $value: { name: true } },
            updated_by__users: { $relation: 'users', $alias: 'updater', $value: { name: true } },
        };
        const original = structuredClone(columns);
        const query = new SupabaseQueryBuilder({ columns });

        expect(query.selectString).toBe('id, users:users!created_by(name), updater:users!updated_by(name)');
        expect(columns).toEqual(original);
    });

    it('disambiguates reverse references using the foreign key on the related table', () => {
        const query = new SupabaseQueryBuilder({
            columns: {
                name: true,
                audit_logs__created_by: { $relation: 'audit_logs', $value: { id: true } },
                audit_logs__updated_by: { $relation: 'audit_logs', $value: { id: true } },
            },
        });

        expect(query.selectString).toBe(
            'name, audit_logs__created_by:audit_logs!created_by(id), audit_logs__updated_by:audit_logs!updated_by(id)'
        );
    });

    it('keeps nested filter and sort scopes separate from FK hints and inner join modifiers', () => {
        const builder = new SupabaseQueryBuilder({
            columns: {
                created_by__users: {
                    $relation: 'users',
                    $alias: 'creator',
                    $value: {
                        team_id__teams: { $relation: 'teams', $alias: 'team', $value: { name: true } },
                    },
                },
            },
            filters: {
                link: '$and',
                conditions: [
                    { field: ['created_by__users', 'team_id__teams', 'name'], operator: 'eq', value: 'Support' },
                ],
            },
            includes: [
                {
                    path: ['created_by__users', 'team_id__teams'],
                    sort: [{ field: 'name', direction: 'ASC' }],
                },
            ],
        });
        const query = { eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis() };
        builder.applyFilters(query);
        builder.applySort(query);

        expect(builder.selectString).toBe('creator:users!created_by!inner(team:teams!team_id!inner(name))');
        expect(query.eq).toHaveBeenCalledWith('creator.team.name', 'Support');
        expect(query.order).toHaveBeenCalledWith('name', { ascending: true, referencedTable: 'creator.team' });
    });

    it('disambiguates references inferred from filters even when related columns are not selected', () => {
        const builder = new SupabaseQueryBuilder({
            filters: {
                link: '$and',
                conditions: [{ field: ['created_by__users', 'name'], operator: 'eq', value: 'Alice' }],
            },
        });
        expect(builder.selectString).toBe('*, created_by__users:users!created_by!inner(*)');
    });

    it('preserves explicit constraint hints and arbitrary workflow relation keys', () => {
        const query = new SupabaseQueryBuilder({
            columns: {
                created_by__users: { $relation: 'users!audit_logs_created_by_fkey', $alias: 'creator', $value: '*' },
                owner: { $relation: 'users', $value: '*' },
            },
            joinTypes: { created_by__users: 'inner' },
        });
        expect(query.selectString).toBe('creator:users!audit_logs_created_by_fkey!inner(*), owner:users(*)');
    });
});
