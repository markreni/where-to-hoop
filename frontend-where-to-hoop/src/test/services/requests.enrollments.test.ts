import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseMockInstance } from './supabaseMock'

vi.mock('../../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

import {
  fetchUserEnrollments,
  fetchAllEnrollments,
  fetchHoopEnrollments,
  insertEnrollment,
  deleteEnrollment,
  fetchExpiredEnrollmentCount,
  fetchEnrollmentsForPlayers,
  fetchActiveEnrollments,
} from '../../services/requests'

const { queueTable, supabase } = supabaseMockInstance

const enrollmentRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'e-1',
  player_id: 'p-1',
  player_nickname: 'Nick',
  hoop_id: 'h-1',
  arrival_time: '2026-04-15T12:00:00Z',
  duration: 60,
  expired: false,
  play_mode: 'open',
  note: null,
  created_at: '2026-04-15T11:00:00Z',
  ...overrides,
})

beforeEach(() => {
  supabaseMockInstance.reset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('fetchUserEnrollments', () => {
  it('maps rows to PlayerEnrollment and parses dates', async () => {
    queueTable('player_enrollment', { data: [enrollmentRow()], error: null })
    const result = await fetchUserEnrollments('p-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e-1')
    expect(result[0].arrivalTime).toBeInstanceOf(Date)
    expect(result[0].createdAt).toBeInstanceOf(Date)
    expect(result[0].note).toBeUndefined()
  })

  it('returns empty array when data is null', async () => {
    queueTable('player_enrollment', { data: null, error: null })
    expect(await fetchUserEnrollments('p-1')).toEqual([])
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'boom' },
    })
    await expect(fetchUserEnrollments('p-1')).rejects.toBeDefined()
  })
})

describe('fetchAllEnrollments', () => {
  it('maps all enrollments returned', async () => {
    queueTable('player_enrollment', {
      data: [enrollmentRow(), enrollmentRow({ id: 'e-2' })],
      error: null,
    })
    const result = await fetchAllEnrollments()
    expect(result).toHaveLength(2)
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchAllEnrollments()).rejects.toBeDefined()
  })
})

describe('fetchHoopEnrollments', () => {
  it('passes the note through when present', async () => {
    queueTable('player_enrollment', {
      data: [enrollmentRow({ note: 'bring a ball' })],
      error: null,
    })
    const result = await fetchHoopEnrollments('h-1')
    expect(result[0].note).toBe('bring a ball')
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'nope' },
    })
    await expect(fetchHoopEnrollments('h-1')).rejects.toBeDefined()
  })
})

describe('insertEnrollment', () => {
  it('inserts and returns the mapped enrollment', async () => {
    queueTable('player_enrollment', {
      data: enrollmentRow({ id: 'created' }),
      error: null,
    })

    const result = await insertEnrollment({
      playerId: 'p-1',
      playerNickname: 'Nick',
      hoopId: 'h-1',
      arrivalTime: new Date('2026-04-15T12:00:00Z'),
      duration: 60,
      expired: false,
      playMode: 'open',
    })

    expect(result.id).toBe('created')
    expect(result.arrivalTime).toBeInstanceOf(Date)
  })

  it('throws on insert error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'conflict' },
    })
    await expect(
      insertEnrollment({
        playerId: 'p-1',
        playerNickname: 'Nick',
        hoopId: 'h-1',
        arrivalTime: new Date(),
        duration: 60,
        expired: false,
        playMode: 'open',
      }),
    ).rejects.toBeDefined()
  })
})

describe('deleteEnrollment', () => {
  it('resolves on success', async () => {
    queueTable('player_enrollment', { data: null, error: null })
    await expect(deleteEnrollment('e-1')).resolves.toBeUndefined()
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'nope' },
    })
    await expect(deleteEnrollment('e-1')).rejects.toBeDefined()
  })
})

describe('fetchExpiredEnrollmentCount', () => {
  it('returns count from supabase', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: null,
      count: 3,
    })
    expect(await fetchExpiredEnrollmentCount('p-1')).toBe(3)
  })

  it('returns 0 when count is null', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: null,
      count: null,
    })
    expect(await fetchExpiredEnrollmentCount('p-1')).toBe(0)
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchExpiredEnrollmentCount('p-1')).rejects.toBeDefined()
  })
})

describe('fetchEnrollmentsForPlayers', () => {
  it('short-circuits and returns [] when given no ids', async () => {
    const result = await fetchEnrollmentsForPlayers([])
    expect(result).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('maps returned rows', async () => {
    queueTable('player_enrollment', { data: [enrollmentRow()], error: null })
    const result = await fetchEnrollmentsForPlayers(['p-1'])
    expect(result).toHaveLength(1)
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchEnrollmentsForPlayers(['p-1'])).rejects.toBeDefined()
  })
})

describe('fetchActiveEnrollments', () => {
  it('maps returned rows', async () => {
    queueTable('player_enrollment', { data: [enrollmentRow()], error: null })
    const result = await fetchActiveEnrollments('p-1')
    expect(result).toHaveLength(1)
    expect(result[0].expired).toBe(false)
  })

  it('throws on error', async () => {
    queueTable('player_enrollment', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchActiveEnrollments('p-1')).rejects.toBeDefined()
  })
})
