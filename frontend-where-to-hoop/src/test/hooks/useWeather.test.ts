import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// ── Mocks ──

let mockLocation: { latitude: number | null; longitude: number | null } = {
  latitude: null,
  longitude: null,
}

vi.mock('../../contexts/LocationContext.tsx', () => ({
  useUserLocation: () => mockLocation,
}))

// ── Helpers ──

const makeFetchResponse = (code = 0, temp = 20, feelsLike = 19) =>
  ({
    ok: true,
    json: async () => ({
      current: {
        temperature_2m: temp,
        apparent_temperature: feelsLike,
        weather_code: code,
      },
    }),
  }) as Response

async function importModule() {
  return await import('../../hooks/useWeather')
}

// ── Tests ──

describe('useWeather', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    mockLocation = { latitude: null, longitude: null }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hook behavior', () => {
    it('stays idle when user location is missing', async () => {
      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      expect(result.current.status).toBe('idle')
      expect(result.current.data).toBeNull()
    })

    it('fetches weather when location is available', async () => {
      mockLocation = { latitude: 60.17, longitude: 24.94 }
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(makeFetchResponse(1, 18.6, 17.4))

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(result.current.data).toEqual({
        temperature: 19,
        feelsLike: 17,
        weatherCode: 1,
      })
    })

    it('uses cached data when within 30 minutes and same location', async () => {
      const cached = {
        data: { temperature: 22, feelsLike: 21, weatherCode: 0 },
        timestamp: Date.now(),
        coordinates: { lat: 60.17, lon: 24.94 },
      }
      localStorage.setItem('weatherCache', JSON.stringify(cached))
      mockLocation = { latitude: 60.17, longitude: 24.94 }

      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(result.current.data).toEqual(cached.data)
    })

    it('refetches when cache is expired', async () => {
      const cached = {
        data: { temperature: 22, feelsLike: 21, weatherCode: 0 },
        timestamp: Date.now() - 31 * 60 * 1000, // 31 min ago
        coordinates: { lat: 60.17, lon: 24.94 },
      }
      localStorage.setItem('weatherCache', JSON.stringify(cached))
      mockLocation = { latitude: 60.17, longitude: 24.94 }

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(makeFetchResponse(2, 15, 14))

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(result.current.data?.temperature).toBe(15)
    })

    it('refetches when coordinates differ from cache', async () => {
      const cached = {
        data: { temperature: 22, feelsLike: 21, weatherCode: 0 },
        timestamp: Date.now(),
        coordinates: { lat: 60.17, lon: 24.94 },
      }
      localStorage.setItem('weatherCache', JSON.stringify(cached))
      mockLocation = { latitude: 61.5, longitude: 23.8 } // Tampere

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(makeFetchResponse(3, 10, 8))

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(result.current.data?.temperature).toBe(10)
    })

    it('ignores a corrupt cache entry and refetches', async () => {
      localStorage.setItem('weatherCache', 'not-json{{')
      mockLocation = { latitude: 60.17, longitude: 24.94 }

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(makeFetchResponse(0, 12, 11))

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(fetchSpy).toHaveBeenCalledOnce()
    })

    it('sets error status when fetch fails', async () => {
      mockLocation = { latitude: 60.17, longitude: 24.94 }
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
      } as Response)

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('error')
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toBe('Failed to fetch weather')
    })

    it('sets error status when fetch throws', async () => {
      mockLocation = { latitude: 60.17, longitude: 24.94 }
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('error')
      })
    })

    it('writes successful result to cache', async () => {
      mockLocation = { latitude: 60.17, longitude: 24.94 }
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeFetchResponse(0, 20, 19),
      )

      const { useWeather } = await importModule()
      const { result } = renderHook(() => useWeather())

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      const cached = JSON.parse(localStorage.getItem('weatherCache')!)
      expect(cached.data).toEqual({
        temperature: 20,
        feelsLike: 19,
        weatherCode: 0,
      })
      expect(cached.coordinates).toEqual({ lat: 60.17, lon: 24.94 })
    })
  })

  describe('isGoodWeatherForBasketball', () => {
    it('returns false for null data', async () => {
      const { isGoodWeatherForBasketball } = await importModule()
      expect(isGoodWeatherForBasketball(null)).toBe(false)
    })

    it('returns true for warm, clear weather', async () => {
      const { isGoodWeatherForBasketball } = await importModule()
      expect(
        isGoodWeatherForBasketball({
          temperature: 18,
          feelsLike: 17,
          weatherCode: 1,
        }),
      ).toBe(true)
    })

    it('returns false when too cold', async () => {
      const { isGoodWeatherForBasketball } = await importModule()
      expect(
        isGoodWeatherForBasketball({
          temperature: 5,
          feelsLike: 3,
          weatherCode: 1,
        }),
      ).toBe(false)
    })

    it('returns false when raining', async () => {
      const { isGoodWeatherForBasketball } = await importModule()
      expect(
        isGoodWeatherForBasketball({
          temperature: 18,
          feelsLike: 17,
          weatherCode: 61,
        }),
      ).toBe(false)
    })
  })

  describe('isWarmWeather', () => {
    it('returns false for null data', async () => {
      const { isWarmWeather } = await importModule()
      expect(isWarmWeather(null)).toBe(false)
    })

    it('returns true at or above 15°C', async () => {
      const { isWarmWeather } = await importModule()
      expect(
        isWarmWeather({ temperature: 15, feelsLike: 15, weatherCode: 0 }),
      ).toBe(true)
    })

    it('returns false below 15°C', async () => {
      const { isWarmWeather } = await importModule()
      expect(
        isWarmWeather({ temperature: 14, feelsLike: 14, weatherCode: 0 }),
      ).toBe(false)
    })
  })

  describe('isRainyWeather', () => {
    it('returns false for null data', async () => {
      const { isRainyWeather } = await importModule()
      expect(isRainyWeather(null)).toBe(false)
    })

    it.each([51, 55, 61, 67])('returns true for rain code %i', async (code) => {
      const { isRainyWeather } = await importModule()
      expect(
        isRainyWeather({ temperature: 10, feelsLike: 9, weatherCode: code }),
      ).toBe(true)
    })

    it('returns false for non-rain codes', async () => {
      const { isRainyWeather } = await importModule()
      expect(
        isRainyWeather({ temperature: 10, feelsLike: 9, weatherCode: 0 }),
      ).toBe(false)
      expect(
        isRainyWeather({ temperature: 10, feelsLike: 9, weatherCode: 71 }),
      ).toBe(false)
    })
  })

  describe('isSnowyWeather', () => {
    it('returns false for null data', async () => {
      const { isSnowyWeather } = await importModule()
      expect(isSnowyWeather(null)).toBe(false)
    })

    it.each([71, 73, 77])('returns true for snow code %i', async (code) => {
      const { isSnowyWeather } = await importModule()
      expect(
        isSnowyWeather({ temperature: -2, feelsLike: -5, weatherCode: code }),
      ).toBe(true)
    })

    it('returns false for non-snow codes', async () => {
      const { isSnowyWeather } = await importModule()
      expect(
        isSnowyWeather({ temperature: 0, feelsLike: 0, weatherCode: 61 }),
      ).toBe(false)
    })
  })
})
