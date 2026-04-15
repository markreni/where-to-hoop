import { vi, type Mock } from 'vitest'

/**
 * Shared Supabase mock for all tests.
 *
 *  - supabase.from(table) returns a chainable query builder whose chain
 *    methods all return `this` and which resolves (via `.then`) to:
 *      1. the next queued result for the table, or
 *      2. a registered default for the table, or
 *      3. in strict mode, throws; otherwise returns { data: [], error: null }.
 *  - Storage and auth are plain vi mocks; tests override per-call with
 *    mockResolvedValueOnce / mockRejectedValueOnce or the setSession helper.
 *  - Default auth state: signed out. Call setSession(...) to opt into signed-in.
 */

export interface QueryResult {
  data?: unknown
  error?: unknown
  count?: number | null
}

export type MockSession = {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
    app_metadata?: Record<string, unknown>
  }
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
  getBuilder: (table: string, nth?: number) => QueryBuilder
  setSession: (session: MockSession | null) => void
  setStrictQueue: (strict: boolean) => void
  storageUpload: Mock
  storageRemove: Mock
  storagePublicUrl: Mock
  reset: () => void
}

export type QueryBuilder = Record<string, Mock> & {
  then: (onF?: (v: QueryResult) => unknown, onR?: (r: unknown) => unknown) => Promise<unknown>
}

function createSupabaseMock(): SupabaseMock {
  const tableQueues = new Map<string, QueryResult[]>()
  const tableDefaults = new Map<string, QueryResult>()
  const buildersByTable = new Map<string, QueryBuilder[]>()
  let strictQueue = false
  let currentSession: MockSession | null = null

  const chainMethodNames = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'ilike', 'like', 'not', 'is', 'or',
    'gte', 'lte', 'gt', 'lt', 'contains', 'containedBy',
    'order', 'limit', 'range', 'single', 'maybeSingle',
  ] as const

  const makeQueryBuilder = (table: string): QueryBuilder => {
    const builder = {} as QueryBuilder
    for (const m of chainMethodNames) {
      builder[m] = vi.fn(() => builder)
    }
    builder.then = (onF, onR) => {
      const q = tableQueues.get(table)
      if (q && q.length > 0) {
        return Promise.resolve(q.shift()!).then(onF, onR)
      }
      const def = tableDefaults.get(table)
      if (def) return Promise.resolve(def).then(onF, onR)
      if (strictQueue) {
        throw new Error(
          `supabaseMock: no queued result for table "${table}". ` +
            `Call queueTable("${table}", {...}) before the awaited query, ` +
            `or setTableDefault("${table}", {...}).`,
        )
      }
      return Promise.resolve({ data: [], error: null }).then(onF, onR)
    }
    if (!buildersByTable.has(table)) buildersByTable.set(table, [])
    buildersByTable.get(table)!.push(builder)
    return builder
  }

  const storageUpload = vi.fn().mockResolvedValue({ error: null })
  const storageRemove = vi.fn().mockResolvedValue({ error: null })
  const storagePublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://mock-storage/${path}` },
  }))

  const authListeners = new Set<(event: string, session: MockSession | null) => void>()

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
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: currentSession }, error: null }),
      ),
      onAuthStateChange: vi.fn(
        (cb: (event: string, session: MockSession | null) => void) => {
          authListeners.add(cb)
          cb(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession)
          return {
            data: {
              subscription: {
                unsubscribe: () => authListeners.delete(cb),
              },
            },
          }
        },
      ),
      signOut: vi.fn().mockImplementation(() => {
        currentSession = null
        for (const cb of authListeners) cb('SIGNED_OUT', null)
        return Promise.resolve({ error: null })
      }),
    },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  }

  const reset = () => {
    tableQueues.clear()
    tableDefaults.clear()
    buildersByTable.clear()
    authListeners.clear()
    currentSession = null
    strictQueue = false
    supabase.from.mockClear()
    supabase.rpc.mockReset().mockResolvedValue({ data: null, error: null })
    supabase.auth.signUp.mockReset().mockResolvedValue({ data: {}, error: null })
    supabase.auth.signInWithPassword
      .mockReset()
      .mockResolvedValue({ data: {}, error: null })
    supabase.auth.updateUser.mockReset().mockResolvedValue({ data: {}, error: null })
    supabase.auth.getSession.mockClear()
    supabase.auth.onAuthStateChange.mockClear()
    supabase.auth.signOut.mockClear()
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
    getBuilder: (table, nth = 0) => {
      const list = buildersByTable.get(table)
      if (!list || !list[nth]) {
        throw new Error(
          `supabaseMock: no builder for table "${table}" at index ${nth}. ` +
            `Created so far: ${list?.length ?? 0}.`,
        )
      }
      return list[nth]
    },
    setSession: (session) => {
      currentSession = session
      for (const cb of authListeners) {
        cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
      }
    },
    setStrictQueue: (v) => {
      strictQueue = v
    },
    storageUpload,
    storageRemove,
    storagePublicUrl,
    reset,
  }
}

export const supabaseMockInstance = createSupabaseMock()

export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'mock@example.com',
  user_metadata: { nickname: 'MockUser', public: true },
}
