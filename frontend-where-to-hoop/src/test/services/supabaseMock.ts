import { vi, type Mock } from 'vitest'

/**
 * Shared Supabase mock used by the requests.* test files.
 *
 * Philosophy:
 *  - supabase.from(table) returns a chainable query builder whose chain
 *    methods all return `this` and which resolves (via `.then`) to the
 *    next queued result for that table, or a registered default, or
 *    `{ data: [], error: null }`.
 *  - Storage and auth are plain vi mocks; tests override per-call with
 *    mockResolvedValueOnce / mockRejectedValueOnce.
 *
 * Usage:
 *   import { supabaseMockInstance } from './supabaseMock'
 *   vi.mock('../../utils/supabase', () => ({ default: supabaseMockInstance.supabase }))
 *   beforeEach(() => supabaseMockInstance.reset())
 *   ...
 *   supabaseMockInstance.queueTable('basketball_hoop', { data: [...], error: null })
 */

export interface QueryResult {
  data?: unknown
  error?: unknown
  count?: number | null
}

export interface SupabaseMock {
  supabase: {
    from: Mock
    rpc: Mock
    storage: { from: Mock }
    auth: {
      signUp: Mock
      signInWithPassword: Mock
      updateUser: Mock
      getSession: Mock
      onAuthStateChange: Mock
      signOut: Mock
    }
    channel: Mock
    removeChannel: Mock
  }
  queueTable: (table: string, result: QueryResult) => void
  setTableDefault: (table: string, result: QueryResult) => void
  storageUpload: Mock
  storageRemove: Mock
  storagePublicUrl: Mock
  reset: () => void
}

function createSupabaseMock(): SupabaseMock {
  const tableQueues = new Map<string, QueryResult[]>()
  const tableDefaults = new Map<string, QueryResult>()

  const chainMethodNames = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'ilike', 'like', 'not', 'is', 'or',
    'gte', 'lte', 'gt', 'lt', 'contains', 'containedBy',
    'order', 'limit', 'range', 'single', 'maybeSingle',
  ] as const

  const makeQueryBuilder = (table: string) => {
    const builder: Record<string, unknown> = {}
    for (const m of chainMethodNames) {
      builder[m] = vi.fn(() => builder)
    }
    builder.then = (onF: ((v: QueryResult) => unknown) | undefined, onR?: ((r: unknown) => unknown) | undefined) => {
      const q = tableQueues.get(table)
      const next = q && q.length > 0
        ? q.shift()!
        : tableDefaults.get(table) ?? { data: [], error: null }
      return Promise.resolve(next).then(onF, onR)
    }
    return builder
  }

  const storageUpload = vi.fn().mockResolvedValue({ error: null })
  const storageRemove = vi.fn().mockResolvedValue({ error: null })
  const storagePublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://mock-storage/${path}` },
  }))

  const supabase = {
    from: vi.fn((table: string) => makeQueryBuilder(table)),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn(() => ({
        upload: storageUpload,
        remove: storageRemove,
        getPublicUrl: storagePublicUrl,
      })),
    },
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  }

  const reset = () => {
    tableQueues.clear()
    tableDefaults.clear()
    supabase.from.mockClear()
    supabase.rpc.mockReset().mockResolvedValue({ data: null, error: null })
    supabase.auth.signUp.mockReset().mockResolvedValue({ data: {}, error: null })
    supabase.auth.signInWithPassword.mockReset().mockResolvedValue({ data: {}, error: null })
    supabase.auth.updateUser.mockReset().mockResolvedValue({ data: {}, error: null })
    storageUpload.mockReset().mockResolvedValue({ error: null })
    storageRemove.mockReset().mockResolvedValue({ error: null })
    storagePublicUrl.mockReset().mockImplementation((path: string) => ({
      data: { publicUrl: `https://mock-storage/${path}` },
    }))
  }

  return {
    supabase,
    queueTable: (table, result) => {
      if (!tableQueues.has(table)) tableQueues.set(table, [])
      tableQueues.get(table)!.push(result)
    },
    setTableDefault: (table, result) => tableDefaults.set(table, result),
    storageUpload,
    storageRemove,
    storagePublicUrl,
    reset,
  }
}

export const supabaseMockInstance = createSupabaseMock()
