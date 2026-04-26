import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import haversineDistance, {
  reverseGeocode,
  shortenAddress,
} from '../../utils/functions'
import { groupEnrollmentsByTime, groupEnrollmentsByHoop } from '../../utils/enrollments'
import { getTimeSlotStartHour, isTodayDate } from '../../utils/time'
import type { PlayerEnrollment } from '../../types/types'

const makeEnrollment = (
  overrides: Partial<PlayerEnrollment> & { id: string; arrivalTime: Date; duration: number },
): PlayerEnrollment => ({
  playerId: 'player-1',
  playerNickname: 'Player',
  hoopId: 'hoop-1',
  expired: false,
  playMode: 'open',
  createdAt: new Date('2026-04-15T08:00:00Z'),
  ...overrides,
})

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    expect(haversineDistance([60.17, 24.94], [60.17, 24.94])).toBeCloseTo(0, 5)
  })

  it('computes km distance between Helsinki and Tampere', () => {
    // Helsinki (60.17, 24.94) → Tampere (61.50, 23.76): ~160 km
    const km = haversineDistance([60.17, 24.94], [61.5, 23.76])
    expect(km).toBeGreaterThan(150)
    expect(km).toBeLessThan(180)
  })

  it('returns distance in miles when isMiles flag set', () => {
    const km = haversineDistance([60.17, 24.94], [61.5, 23.76])
    const miles = haversineDistance([60.17, 24.94], [61.5, 23.76], true)
    expect(miles).toBeCloseTo(km / 1.60934, 3)
  })
})

describe('getTimeSlotStartHour', () => {
  it('returns the correct start hour per slot', () => {
    expect(getTimeSlotStartHour('morning')).toBe(8)
    expect(getTimeSlotStartHour('afternoon')).toBe(12)
    expect(getTimeSlotStartHour('evening')).toBe(17)
    expect(getTimeSlotStartHour('night')).toBe(21)
  })
})

describe('groupEnrollmentsByTime', () => {
  const NOW = new Date('2026-04-15T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty groups for empty input', () => {
    expect(groupEnrollmentsByTime()).toEqual({
      playingNow: [],
      comingSoon: [],
      comingLater: [],
    })
  })

  it('classifies players currently on the court as playingNow', () => {
    const e = makeEnrollment({
      id: 'e1',
      arrivalTime: new Date('2026-04-15T11:30:00Z'), // arrived 30 min ago
      duration: 60, // ends at 12:30, after NOW
    })
    const result = groupEnrollmentsByTime([e])
    expect(result.playingNow).toHaveLength(1)
    expect(result.comingSoon).toHaveLength(0)
    expect(result.comingLater).toHaveLength(0)
  })

  it('classifies future arrivals today as comingSoon', () => {
    const e = makeEnrollment({
      id: 'e1',
      arrivalTime: new Date('2026-04-15T18:00:00Z'),
      duration: 60,
    })
    const result = groupEnrollmentsByTime([e])
    expect(result.comingSoon).toEqual([e])
  })

  it('classifies arrivals on future days as comingLater', () => {
    const e = makeEnrollment({
      id: 'e1',
      arrivalTime: new Date('2026-04-16T10:00:00Z'),
      duration: 60,
    })
    const result = groupEnrollmentsByTime([e])
    expect(result.comingLater).toEqual([e])
  })

  it('sorts each group by arrival time ascending', () => {
    const later = makeEnrollment({
      id: 'later',
      arrivalTime: new Date('2026-04-15T20:00:00Z'),
      duration: 60,
    })
    const sooner = makeEnrollment({
      id: 'sooner',
      arrivalTime: new Date('2026-04-15T14:00:00Z'),
      duration: 60,
    })
    const result = groupEnrollmentsByTime([later, sooner])
    expect(result.comingSoon.map((e) => e.id)).toEqual(['sooner', 'later'])
  })

  it('splits a mixed list into the correct buckets', () => {
    const enrollments = [
      makeEnrollment({
        id: 'now',
        arrivalTime: new Date('2026-04-15T11:45:00Z'),
        duration: 60,
      }),
      makeEnrollment({
        id: 'soon',
        arrivalTime: new Date('2026-04-15T19:00:00Z'),
        duration: 60,
      }),
      makeEnrollment({
        id: 'later',
        arrivalTime: new Date('2026-04-17T10:00:00Z'),
        duration: 60,
      }),
    ]
    const result = groupEnrollmentsByTime(enrollments)
    expect(result.playingNow.map((e) => e.id)).toEqual(['now'])
    expect(result.comingSoon.map((e) => e.id)).toEqual(['soon'])
    expect(result.comingLater.map((e) => e.id)).toEqual(['later'])
  })
})

describe('groupEnrollmentsByHoop', () => {
  it('returns empty map for empty input', () => {
    expect(groupEnrollmentsByHoop([]).size).toBe(0)
  })

  it('groups enrollments by hoopId', () => {
    const a1 = makeEnrollment({
      id: 'a1',
      hoopId: 'h1',
      arrivalTime: new Date(),
      duration: 60,
    })
    const a2 = makeEnrollment({
      id: 'a2',
      hoopId: 'h1',
      arrivalTime: new Date(),
      duration: 60,
    })
    const b1 = makeEnrollment({
      id: 'b1',
      hoopId: 'h2',
      arrivalTime: new Date(),
      duration: 60,
    })

    const map = groupEnrollmentsByHoop([a1, a2, b1])
    expect(map.get('h1')).toEqual([a1, a2])
    expect(map.get('h2')).toEqual([b1])
  })

  it('skips enrollments with null hoopId', () => {
    const orphan = makeEnrollment({
      id: 'orphan',
      hoopId: null,
      arrivalTime: new Date(),
      duration: 60,
    })
    const attached = makeEnrollment({
      id: 'attached',
      hoopId: 'h1',
      arrivalTime: new Date(),
      duration: 60,
    })

    const map = groupEnrollmentsByHoop([orphan, attached])
    expect(map.size).toBe(1)
    expect(map.get('h1')).toEqual([attached])
  })
})

describe('reverseGeocode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a formatted address when all fields are present', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          road: 'Mannerheimintie',
          house_number: '10',
          city: 'Helsinki',
          state: 'Uusimaa',
          postcode: '00100',
        },
      }),
    } as Response)

    const result = await reverseGeocode(60.17, 24.94)
    expect(result).toBe('Mannerheimintie 10, 00100, Helsinki, Uusimaa')
  })

  it('returns null when required fields are missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          road: 'Mannerheimintie',
          city: 'Helsinki',
          state: 'Uusimaa',
          postcode: '00100',
          // no house_number
        },
      }),
    } as Response)

    const result = await reverseGeocode(60.17, 24.94)
    expect(result).toBeNull()
  })

  it('returns null when the response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response)
    const result = await reverseGeocode(60.17, 24.94)
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const result = await reverseGeocode(60.17, 24.94)
    expect(result).toBeNull()
  })
})

describe('isTodayDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for today (different time)', () => {
    expect(isTodayDate(new Date(2026, 3, 15, 23, 0, 0))).toBe(true)
  })

  it('returns false for yesterday', () => {
    expect(isTodayDate(new Date(2026, 3, 14, 12, 0, 0))).toBe(false)
  })

  it('returns false for tomorrow', () => {
    expect(isTodayDate(new Date(2026, 3, 16, 0, 30, 0))).toBe(false)
  })
})

describe('shortenAddress', () => {
  it('keeps the first two segments by default', () => {
    expect(shortenAddress('Mannerheimintie 10, 00100, Helsinki, Uusimaa')).toBe(
      'Mannerheimintie 10, 00100',
    )
  })

  it('respects a custom parts count', () => {
    expect(
      shortenAddress('Mannerheimintie 10, 00100, Helsinki, Uusimaa', 3),
    ).toBe('Mannerheimintie 10, 00100, Helsinki')
  })

  it('returns the full address when it has fewer segments than parts', () => {
    expect(shortenAddress('Helsinki', 2)).toBe('Helsinki')
    expect(shortenAddress('Helsinki, Uusimaa', 2)).toBe('Helsinki, Uusimaa')
  })
})
