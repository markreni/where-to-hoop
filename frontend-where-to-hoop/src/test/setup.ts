import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { supabaseMockInstance } from './services/supabaseMock'

// Single shared Supabase mock across every test file. The mock defaults to
// SIGNED_OUT — tests that need an authenticated user call
// supabaseMockInstance.setSession(...) in their own beforeEach.
vi.mock('../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

// Default per-table fallbacks for render-only tests that happen to hit the
// database during mount (subscriptions, enrollment inserts, etc.). Tests that
// care about the shape of the response still queue their own results.
const applyGlobalDefaults = () => {
  supabaseMockInstance.setTableDefault('player_enrollment', {
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
      expired: false,
    },
    error: null,
  })
}
applyGlobalDefaults()

afterEach(() => {
  cleanup()
  supabaseMockInstance.reset()
  applyGlobalDefaults()
})

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
})
