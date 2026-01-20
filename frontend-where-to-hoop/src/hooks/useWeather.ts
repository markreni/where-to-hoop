import { useState, useEffect } from 'react'
import { useUserLocation } from '../contexts/LocationContext.tsx'

export interface WeatherData {
  temperature: number
  feelsLike: number
  weatherCode: number
}

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error'

export interface WeatherState {
  status: WeatherStatus
  data: WeatherData | null
  error: string | null
}

interface CachedWeather {
  data: WeatherData
  timestamp: number
  coordinates: { lat: number; lon: number }
}

const CACHE_KEY = 'weatherCache'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

const getCachedWeather = (lat: number, lon: number): WeatherData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed: CachedWeather = JSON.parse(cached)
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION
    const isSameLocation =
      Math.abs(parsed.coordinates.lat - lat) < 0.01 &&
      Math.abs(parsed.coordinates.lon - lon) < 0.01

    if (!isExpired && isSameLocation) {
      return parsed.data
    }
  } catch {
    // Invalid cache
  }
  return null
}

const setCachedWeather = (data: WeatherData, lat: number, lon: number): void => {
  const cache: CachedWeather = {
    data,
    timestamp: Date.now(),
    coordinates: { lat, lon },
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Weather fetch failed')

  const data = await response.json()
  return {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    weatherCode: data.current.weather_code,
  }
}

export const useWeather = (): WeatherState => {
  const userLocation = useUserLocation()
  const [weather, setWeather] = useState<WeatherState>({
    status: 'idle',
    data: null,
    error: null,
  })

  useEffect(() => {
    if (!userLocation.latitude || !userLocation.longitude) {
      setWeather({ status: 'idle', data: null, error: null })
      return
    }

    const fetchData = async () => {
      const cached = getCachedWeather(userLocation.latitude!, userLocation.longitude!)
      if (cached) {
        setWeather({ status: 'success', data: cached, error: null })
        return
      }

      setWeather(prev => ({ ...prev, status: 'loading' }))

      try {
        const data = await fetchWeatherData(userLocation.latitude!, userLocation.longitude!)
        setCachedWeather(data, userLocation.latitude!, userLocation.longitude!)
        setWeather({ status: 'success', data, error: null })
      } catch {
        setWeather({ status: 'error', data: null, error: 'Failed to fetch weather' })
      }
    }

    fetchData()
  }, [userLocation.latitude, userLocation.longitude])

  return weather
}

// Helper to determine if weather is good for basketball
export const isGoodWeatherForBasketball = (data: WeatherData | null): boolean => {
  if (!data) return false
  // Good weather: temperature >= 10°C, not raining/snowing (code < 51)
  return data.temperature >= 10 && data.weatherCode < 51
}

// Helper to determine if it's warm outside
export const isWarmWeather = (data: WeatherData | null): boolean => {
  if (!data) return false
  return data.temperature >= 15
}

// Helper to check if it's rainy
export const isRainyWeather = (data: WeatherData | null): boolean => {
  if (!data) return false
  return data.weatherCode >= 51 && data.weatherCode <= 67
}

// Helper to check if it's snowy
export const isSnowyWeather = (data: WeatherData | null): boolean => {
  if (!data) return false
  return data.weatherCode >= 71 && data.weatherCode <= 77
}
