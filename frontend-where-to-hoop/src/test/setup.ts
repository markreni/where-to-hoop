import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('../utils/supabase', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'mock-id',
              player_id: 'mock-user-id',
              player_nickname: 'MockUser',
              hoop_id: 'test-hoop-1',
              arrival_time: new Date().toISOString(),
              duration: 60,
              play_mode: 'open',
              note: null,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
              user_metadata: { nickname: 'MockUser' },
            },
          },
        },
        error: null,
      }),
      onAuthStateChange: vi.fn((cb) => {
        cb('SIGNED_IN', {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            user_metadata: { nickname: 'MockUser' },
          },
        })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://mock-storage/${path}` } })),
      })),
    },
  },
}));

afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
