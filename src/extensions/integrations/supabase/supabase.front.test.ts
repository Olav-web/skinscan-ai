import { describe, expect, it, vi } from 'vitest';

vi.mock('@/_common/helpers/code/customCode.js', () => ({ getValue: vi.fn() }));
vi.mock('@/pinia/backAuth.js', () => ({ useBackAuthStore: vi.fn() }));

import supabaseFront from './supabase.front';
import { SupabaseColumns } from './utils/supabaseColumns';
import { SupabaseFilters } from './utils/supabaseFilters';
import { SupabaseQueryBuilder } from './utils/supabaseQueryBuilder';
import { SupabaseSorts } from './utils/supabaseSorts';
import type { SupabaseFilter, SupabaseFilterValue } from './supabase.types';

type FakeSupabaseReferencedTableOptions = { referencedTable?: string };
type FakeSupabaseOrderOptions = { ascending: boolean; referencedTable?: string };
type FakeSupabaseQueryArg = SupabaseFilterValue | FakeSupabaseReferencedTableOptions | FakeSupabaseOrderOptions;

class FakeSupabaseQuery {
    calls: Array<{ method: string; args: FakeSupabaseQueryArg[] }> = [];

    eq(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'eq', args: [column, value] });
        return this;
    }

    neq(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'neq', args: [column, value] });
        return this;
    }

    gt(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'gt', args: [column, value] });
        return this;
    }

    gte(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'gte', args: [column, value] });
        return this;
    }

    lt(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'lt', args: [column, value] });
        return this;
    }

    lte(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'lte', args: [column, value] });
        return this;
    }

    ilike(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'ilike', args: [column, value] });
        return this;
    }

    is(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'is', args: [column, value] });
        return this;
    }

    in(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'in', args: [column, value] });
        return this;
    }

    contains(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'contains', args: [column, value] });
        return this;
    }

    overlaps(column: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'overlaps', args: [column, value] });
        return this;
    }

    not(column: string, operator: string, value: SupabaseFilterValue) {
        this.calls.push({ method: 'not', args: [column, operator, value] });
        return this;
    }

    order(column: string, options: { ascending: boolean; referencedTable?: string }) {
        this.calls.push({ method: 'order', args: [column, options] });
        return this;
    }

    or(expression: string, options?: FakeSupabaseReferencedTableOptions) {
        this.calls.push({ method: 'or', args: options === undefined ? [expression] : [expression, options] });
        return this;
    }

    limit(limit: number) {
        this.calls.push({ method: 'limit', args: [limit] });
        return this;
    }

    range(from: number, to: number) {
        this.calls.push({ method: 'range', args: [from, to] });
        return this;
    }

    single() {
        this.calls.push({ method: 'single', args: [] });
        return this;
    }

    maybeSingle() {
        this.calls.push({ method: 'maybeSingle', args: [] });
        return this;
    }
}

describe('SupabaseColumns toSelectString', () => {
    it('serializes scalar column aliases without treating them as relations', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: { $alias: 'post', $value: true },
            }).toSelectString()
        ).toBe('id, post:post_id');
    });

    it('uses Supabase relation metadata with custom response aliases', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: {
                    $alias: 'post',
                    $relation: 'posts',
                    $value: { title: true, content: true },
                },
            }).toSelectString({ post_id: 'inner' })
        ).toBe('id, post:posts!inner(title, content)');
    });

    it('serializes separated foreign key columns and relation metadata', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: { title: true, content: true },
                },
            }).toSelectString()
        ).toBe('id, post_id, posts:posts!post_id(title, content)');
    });

    it('aliases relation metadata back to the config key when no response alias is set', () => {
        expect(
            new SupabaseColumns({
                post_id: { $relation: 'posts', title: true },
            }).toSelectString()
        ).toBe('post_id:posts(title)');
    });

    it('serializes nested Supabase relation metadata recursively', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).toSelectString()
        ).toBe('id, posts(profiles(*))');
    });

    it('serializes nested separated relation metadata recursively', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile: true,
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).toSelectString()
        ).toBe('id, post_id, posts:posts!post_id(profile, profiles:profiles!profile(*))');
    });

    it('serializes nested inner joins from path join types', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).toSelectString({ 'post_id__posts.profile__profiles': 'inner' })
        ).toBe('id, posts:posts!post_id(profiles:profiles!profile!inner(*))');
    });

    it('preserves all parent relation columns with nested relation metadata', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        '*': true,
                        profile: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).toSelectString()
        ).toBe('id, posts(*, profiles(*))');
    });
});

describe('SupabaseColumns resolveField', () => {
    it('maps nested separated relation keys to embedded resource aliases', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id__posts: {
                    $relation: 'posts',
                    $value: {
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).resolveField('post_id__posts.profile__profiles.full_name').column
        ).toBe('post_id__posts.profiles.full_name');
    });

    it('keeps configured relation aliases in nested filter paths', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).resolveField(['post_id__posts', 'profile__profiles', 'full_name']).column
        ).toBe('posts.profiles.full_name');
    });

    it('returns relation scope and scoped column for nested fields', () => {
        expect(
            new SupabaseColumns({
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            }).resolveField(['post_id__posts', 'profile__profiles', 'full_name'])
        ).toEqual({
            column: 'posts.profiles.full_name',
            relationPaths: ['post_id__posts', 'post_id__posts.profile__profiles'],
            scope: 'posts.profiles',
            scopedColumn: 'full_name',
        });
    });
});

describe('SupabaseFilters withJoinTypes', () => {
    it('marks relation paths filtered through nested data as inner joins', () => {
        expect(
            new SupabaseFilters({
                link: '$and',
                conditions: [
                    {
                        field: 'post_id__posts.profile__profiles.full_name',
                        operator: 'eq',
                        value: 'Client 3',
                    },
                ],
            }).withJoinTypes(
                new SupabaseColumns({
                    post_id__posts: {
                        $relation: 'posts',
                        $value: {
                            profile__profiles: {
                                $alias: 'profiles',
                                $relation: 'profiles',
                                $value: '*',
                            },
                        },
                    },
                })
            )
        ).toEqual({
            post_id__posts: 'inner',
            'post_id__posts.profile__profiles': 'inner',
        });
    });

    it('does not force inner joins for null relation filters', () => {
        expect(
            new SupabaseFilters({
                link: '$and',
                conditions: [
                    {
                        field: 'post_id__posts.profile__profiles.full_name',
                        operator: 'is',
                        value: null,
                    },
                ],
            }).withJoinTypes(
                new SupabaseColumns({
                    post_id__posts: {
                        $relation: 'posts',
                        $value: {
                            profile__profiles: {
                                $alias: 'profiles',
                                $relation: 'profiles',
                                $value: '*',
                            },
                        },
                    },
                })
            )
        ).toEqual({});
    });
});

describe('SupabaseFilters inactive groups', () => {
    it('normalizes an inactive root group before validation, join inference, and query application', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            filters: {
                link: '$or',
                if: false,
                conditions: [
                    { field: 'title', operator: 'eq', value: 'Post' },
                    { field: 'post_id__posts.title', operator: 'eq', value: 'Nested post' },
                ],
            },
        });

        expect(queryBuilder.filters.fieldPaths()).toEqual([]);
        expect(queryBuilder.filters.getValidationError(queryBuilder.columns)).toBeNull();
        expect(queryBuilder.selectString).toBe('*');

        queryBuilder.applyFilters(query);

        expect(query.calls).toEqual([]);
    });

    it('prunes an inactive nested AND group before OR serialization and scope validation', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            filters: {
                link: '$or',
                conditions: [
                    { field: 'title', operator: 'eq', value: 'Post' },
                    {
                        link: '$and',
                        if: false,
                        conditions: [{ field: 'post_id__posts.title', operator: 'eq', value: 'Nested post' }],
                    },
                ],
            },
        });

        expect(queryBuilder.filters.fieldPaths()).toEqual([['title']]);
        expect(queryBuilder.filters.getValidationError(queryBuilder.columns)).toBeNull();
        expect(queryBuilder.selectString).toBe('*');

        queryBuilder.applyFilters(query);

        expect(query.calls).toEqual([{ method: 'or', args: ['title.eq.Post'] }]);
    });

    it('prunes an inactive nested OR group before applying an AND group', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$and',
            conditions: [
                { field: 'title', operator: 'eq', value: 'Post' },
                {
                    link: '$or',
                    if: false,
                    conditions: [{ field: 'status', operator: 'eq', value: 'archived' }],
                },
            ],
        }).applyTo(query, new SupabaseColumns());

        expect(query.calls).toEqual([{ method: 'eq', args: ['title', 'Post'] }]);
    });
});

describe('SupabaseFilters withPrefix', () => {
    it('prefixes nested filter groups without mutating the source filter', () => {
        const filter: SupabaseFilter = {
            link: '$and',
            conditions: [
                { field: 'title', operator: 'eq', value: 'Post' },
                {
                    link: '$and',
                    conditions: [{ field: ['profile__profiles', 'full_name'], operator: 'eq', value: 'Leo' }],
                },
            ],
        };
        const query = new FakeSupabaseQuery();

        new SupabaseFilters(filter).withPrefix(['post_id__posts']).applyTo(
            query,
            new SupabaseColumns({
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            })
        );

        expect(query.calls).toEqual([
            { method: 'eq', args: ['posts.title', 'Post'] },
            { method: 'eq', args: ['posts.profiles.full_name', 'Leo'] },
        ]);
        expect(filter).toEqual({
            link: '$and',
            conditions: [
                { field: 'title', operator: 'eq', value: 'Post' },
                {
                    link: '$and',
                    conditions: [{ field: ['profile__profiles', 'full_name'], operator: 'eq', value: 'Leo' }],
                },
            ],
        });
    });

    it('keeps prefixed same-scope or filters on the referenced table', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$or',
            conditions: [
                { field: 'title', operator: 'eq', value: 'Post' },
                { field: 'content', operator: 'ilike', value: '%Cloud%' },
            ],
        })
            .withPrefix(['post_id__posts'])
            .applyTo(
                query,
                new SupabaseColumns({
                    post_id__posts: {
                        $alias: 'posts',
                        $relation: 'posts',
                        $value: {
                            title: true,
                            content: true,
                        },
                    },
                })
            );

        expect(query.calls).toEqual([
            {
                method: 'or',
                args: ['title.eq.Post,content.ilike.%Cloud%', { referencedTable: 'posts' }],
            },
        ]);
    });
});

describe('SupabaseSorts', () => {
    it('applies nested relation sort with a referenced table', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseSorts([{ field: ['post_id__posts', 'profile__profiles', 'full_name'], direction: 'DESC' }]).applyTo(
            query,
            new SupabaseColumns({
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            })
        );

        expect(query.calls).toEqual([
            { method: 'order', args: ['full_name', { ascending: false, referencedTable: 'posts.profiles' }] },
        ]);
    });

    it('applies first-level relation sort to parent rows', () => {
        const sort = [{ field: 'title', direction: 'ASC' }];
        const query = new FakeSupabaseQuery();

        new SupabaseSorts(sort).withPrefix(['post_id__posts']).applyTo(
            query,
            new SupabaseColumns({
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                    },
                },
            })
        );

        expect(query.calls).toEqual([
            { method: 'order', args: ['title', { ascending: true, referencedTable: 'posts' }] },
        ]);
        expect(sort).toEqual([{ field: 'title', direction: 'ASC' }]);
    });
});

describe('SupabaseQueryBuilder', () => {
    it('builds select strings with wildcard columns and nested filter inferred joins', () => {
        expect(
            new SupabaseQueryBuilder({
                filters: {
                    link: '$and',
                    conditions: [
                        {
                            field: ['post_id__posts', 'profile__profiles', 'full_name'],
                            operator: '$iLike:contains',
                            value: 'Client 3',
                        },
                    ],
                },
            }).selectString
        ).toBe('*, post_id__posts:posts!post_id!inner(profile__profiles:profiles!profile!inner(*))');
    });

    it('applies wildcard nested filters against inferred embedded resources', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            filters: {
                link: '$and',
                conditions: [
                    {
                        field: ['post_id__posts', 'profile__profiles', 'full_name'],
                        operator: '$iLike:contains',
                        value: 'Client 3',
                    },
                ],
            },
        });

        queryBuilder.applyFilters(query);

        expect(query.calls).toEqual([
            { method: 'ilike', args: ['post_id__posts.profile__profiles.full_name', '%Client 3%'] },
        ]);
    });

    it('builds select strings with filter inferred joins', () => {
        expect(
            new SupabaseQueryBuilder({
                columns: {
                    id: true,
                    post_id__posts: {
                        $alias: 'posts',
                        $relation: 'posts',
                        $value: {
                            profile__profiles: {
                                $alias: 'profiles',
                                $relation: 'profiles',
                                $value: '*',
                            },
                        },
                    },
                },
                filters: {
                    link: '$and',
                    conditions: [
                        {
                            field: 'post_id__posts.profile__profiles.full_name',
                            operator: 'eq',
                            value: 'Client 3',
                        },
                    ],
                },
            }).selectString
        ).toBe('id, posts:posts!post_id!inner(profiles:profiles!profile!inner(*))');
    });

    it('expands explicit nested join types to parent relations', () => {
        expect(
            new SupabaseQueryBuilder({
                columns: {
                    id: true,
                    post_id__posts: {
                        $alias: 'posts',
                        $relation: 'posts',
                        $value: {
                            profile__profiles: {
                                $alias: 'profiles',
                                $relation: 'profiles',
                                $value: '*',
                            },
                        },
                    },
                },
                joinTypes: {
                    'post_id__posts.profile__profiles': 'inner',
                },
            }).selectString
        ).toBe('id, posts:posts!post_id!inner(profiles:profiles!profile!inner(*))');
    });

    it('applies same-scope nested or filters with a referenced table', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            columns: {
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                        content: true,
                    },
                },
            },
            filters: {
                link: '$or',
                conditions: [
                    { field: 'post_id__posts.title', operator: 'ilike', value: '%Cloud%' },
                    { field: 'post_id__posts.content', operator: 'ilike', value: '%Data%' },
                ],
            },
        });

        queryBuilder.applyFilters(query);

        expect(query.calls).toEqual([
            {
                method: 'or',
                args: ['title.ilike.%Cloud%,content.ilike.%Data%', { referencedTable: 'posts' }],
            },
        ]);
    });

    it('rejects or filters that cross relation scopes', () => {
        const queryBuilder = new SupabaseQueryBuilder({
            columns: {
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                        profile__profiles: {
                            $alias: 'profiles',
                            $relation: 'profiles',
                            $value: '*',
                        },
                    },
                },
            },
            filters: {
                link: '$or',
                conditions: [
                    { field: 'post_id__posts.title', operator: 'ilike', value: '%Cloud%' },
                    { field: 'post_id__posts.profile__profiles.full_name', operator: 'eq', value: 'Client 3' },
                ],
            },
        });

        expect(queryBuilder.filters.getValidationError(queryBuilder.columns)).toBe(
            SupabaseFilters.INVALID_OR_SCOPE_MESSAGE
        );
        expect(() => queryBuilder.applyFilters(new FakeSupabaseQuery())).toThrow(
            SupabaseFilters.INVALID_OR_SCOPE_MESSAGE
        );
    });

    it('translates traditional and filters to Supabase query methods', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$and',
            conditions: [
                { field: 'title', operator: '$iLike:contains', value: 'Cloud' },
                { field: 'created_at', operator: '$gte', value: '2026-01-01' },
                { field: 'deleted_at', operator: '$eq:null', value: null },
                { field: 'status', operator: '$ne:null', value: null },
                { field: 'id', operator: '$notIn', value: ['1', '2'] },
                { field: 'tags', operator: '$contains', value: ['news'] },
                { field: 'tags', operator: '$notOverlap', value: ['draft', 'archived'] },
            ],
        }).applyTo(query, new SupabaseColumns());

        expect(query.calls).toEqual([
            { method: 'ilike', args: ['title', '%Cloud%'] },
            { method: 'gte', args: ['created_at', '2026-01-01'] },
            { method: 'is', args: ['deleted_at', null] },
            { method: 'not', args: ['status', 'is', null] },
            { method: 'not', args: ['id', 'in', '(1,2)'] },
            { method: 'contains', args: ['tags', ['news']] },
            { method: 'not', args: ['tags', 'ov', '{draft,archived}'] },
        ]);
    });

    it('keeps native query method values unescaped', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$and',
            conditions: [
                { field: 'title', operator: '$iLike:contains', value: 'Cloud, Data' },
                { field: 'id', operator: '$in', value: ['1,2', '3'] },
                { field: 'tags', operator: '$contains', value: ['draft,archived'] },
            ],
        }).applyTo(query, new SupabaseColumns());

        expect(query.calls).toEqual([
            { method: 'ilike', args: ['title', '%Cloud, Data%'] },
            { method: 'in', args: ['id', ['1,2', '3']] },
            { method: 'contains', args: ['tags', ['draft,archived']] },
        ]);
    });

    it('translates traditional or filters to scoped PostgREST expressions', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$or',
            conditions: [
                { field: 'post_id__posts.title', operator: '$iLike:contains', value: 'Cloud' },
                { field: 'post_id__posts.content', operator: '$notILike:contains', value: 'Data' },
                { field: 'post_id__posts.id', operator: '$notIn', value: ['1', '2'] },
            ],
        }).applyTo(
            query,
            new SupabaseColumns({
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        id: true,
                        title: true,
                        content: true,
                    },
                },
            })
        );

        expect(query.calls).toEqual([
            {
                method: 'or',
                args: ['title.ilike.%Cloud%,content.not.ilike.%Data%,id.not.in.(1,2)', { referencedTable: 'posts' }],
            },
        ]);
    });

    it('escapes reserved characters in traditional or filters', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$or',
            conditions: [
                { field: 'title', operator: '$iLike:contains', value: 'Cloud, Data' },
                { field: 'content', operator: '$notILike:contains', value: 'Client (3)' },
                { field: 'path', operator: '$eq', value: 'C:\\tmp' },
                { field: 'quote', operator: '$eq', value: 'Client "3"' },
                { field: 'tags', operator: '$overlap', value: ['draft,archived', '{hidden}'] },
            ],
        }).applyTo(query, new SupabaseColumns());

        expect(query.calls).toEqual([
            {
                method: 'or',
                args: [
                    'title.ilike."%Cloud, Data%",content.not.ilike."%Client (3)%",path.eq."C:\\\\tmp",quote.eq."Client \\"3\\"",tags.ov.{"draft,archived","{hidden}"}',
                ],
            },
        ]);
    });

    it('escapes reserved characters in raw not filter values', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseFilters({
            link: '$and',
            conditions: [
                { field: 'title', operator: '$notILike:contains', value: 'Cloud, Data' },
                { field: 'tags', operator: '$notOverlap', value: ['draft,archived', '{hidden}'] },
            ],
        }).applyTo(query, new SupabaseColumns());

        expect(query.calls).toEqual([
            { method: 'not', args: ['title', 'ilike', '"%Cloud, Data%"'] },
            { method: 'not', args: ['tags', 'ov', '{"draft,archived","{hidden}"}'] },
        ]);
    });

    it('applies scoped include filters without inferring inner joins', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            columns: {
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                        content: true,
                    },
                },
            },
            includes: [
                {
                    path: ['post_id__posts'],
                    filters: {
                        link: '$and',
                        conditions: [{ field: 'title', operator: 'eq', value: 'Post' }],
                    },
                },
            ],
        });

        queryBuilder.applyFilters(query);

        expect(queryBuilder.selectString).toBe('id, posts:posts!post_id(title, content)');
        expect(query.calls).toEqual([{ method: 'eq', args: ['posts.title', 'Post'] }]);
    });

    it('applies scoped include or filters with a referenced table', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            columns: {
                id: true,
                post_id__posts: {
                    $alias: 'posts',
                    $relation: 'posts',
                    $value: {
                        title: true,
                        content: true,
                    },
                },
            },
            includes: [
                {
                    path: ['post_id__posts'],
                    filters: {
                        link: '$or',
                        conditions: [
                            { field: 'title', operator: 'eq', value: 'Post' },
                            { field: 'content', operator: 'ilike', value: '%Cloud%' },
                        ],
                    },
                },
            ],
        });

        queryBuilder.applyFilters(query);

        expect(query.calls).toEqual([
            {
                method: 'or',
                args: ['title.eq.Post,content.ilike.%Cloud%', { referencedTable: 'posts' }],
            },
        ]);
    });

    it('uses explicit scoped include join types for select strings', () => {
        expect(
            new SupabaseQueryBuilder({
                columns: {
                    id: true,
                    post_id__posts: {
                        $alias: 'posts',
                        $relation: 'posts',
                        $value: {
                            title: true,
                        },
                    },
                },
                includes: [{ path: ['post_id__posts'], joinType: 'inner' }],
            }).selectString
        ).toBe('id, posts:posts!post_id!inner(title)');
    });

    it('applies action query steps in order', () => {
        const query = new FakeSupabaseQuery();
        const queryBuilder = new SupabaseQueryBuilder({
            filters: {
                link: '$and',
                conditions: [{ field: 'title', operator: 'eq', value: 'Post' }],
            },
            sort: [{ field: 'created_at', direction: 'DESC' }],
            limit: 10,
            offset: 20,
            single: true,
        });

        queryBuilder.applyFilters(query);
        queryBuilder.applySort(query);
        queryBuilder.applyActionPagination(query);
        queryBuilder.applySingleResult(query);

        expect(query.calls).toEqual([
            { method: 'eq', args: ['title', 'Post'] },
            { method: 'order', args: ['created_at', { ascending: false }] },
            { method: 'range', args: [20, 29] },
            { method: 'single', args: [] },
        ]);
    });

    it('applies table view pagination with limit before range', () => {
        const query = new FakeSupabaseQuery();

        new SupabaseQueryBuilder({ limit: 10, offset: 20 }).applyTableViewPagination(query);

        expect(query.calls).toEqual([
            { method: 'limit', args: [10] },
            { method: 'range', args: [20, 29] },
        ]);
    });
});

describe('Supabase auth-update-user', () => {
    type AuthUpdateUserInstance = Parameters<(typeof supabaseFront.actions)['auth-update-user']>[1]['instance'];

    const buildInstance = () => ({
        auth: { updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }) },
    });

    it('forwards current_password to auth.updateUser when provided', async () => {
        const instance = buildInstance();

        await supabaseFront.actions['auth-update-user'](
            { args: { password: 'new-password', currentPassword: 'old-password' } },
            { instance: instance as unknown as AuthUpdateUserInstance }
        );

        expect(instance.auth.updateUser).toHaveBeenCalledWith({
            email: undefined,
            password: 'new-password',
            current_password: 'old-password',
            data: undefined,
        });
    });

    it('omits current_password when not provided', async () => {
        const instance = buildInstance();

        await supabaseFront.actions['auth-update-user'](
            { args: { email: 'user@example.com', data: { full_name: 'Jane Doe' } } },
            { instance: instance as unknown as AuthUpdateUserInstance }
        );

        expect(instance.auth.updateUser).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: undefined,
            current_password: undefined,
            data: { full_name: 'Jane Doe' },
        });
    });
});

describe('Supabase auth-refresh-session', () => {
    it('calls auth.refreshSession and returns the refreshed data', async () => {
        const data = { user: { id: 'user-1' }, session: { access_token: 'new-token' } };
        const instance = {
            auth: { refreshSession: vi.fn().mockResolvedValue({ data, error: null }) },
        };

        const result = await supabaseFront.actions['auth-refresh-session']({}, { instance: instance as any });

        expect(instance.auth.refreshSession).toHaveBeenCalledWith();
        expect(result).toEqual(data);
    });

    it('throws the error returned by auth.refreshSession', async () => {
        const error = new Error('Auth session missing!');
        const instance = {
            auth: { refreshSession: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error }) },
        };

        await expect(
            supabaseFront.actions['auth-refresh-session']({}, { instance: instance as any })
        ).rejects.toThrow('Auth session missing!');
    });

    it('throws when no instance is provided', async () => {
        await expect(supabaseFront.actions['auth-refresh-session']({}, { instance: undefined as any })).rejects.toThrow(
            'Supabase instance is required'
        );
    });
});
