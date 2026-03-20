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
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn().mockResolvedValue({ error: null }),
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
