import { useState, useEffect } from 'react'
import { useUserLocation } from '../../contexts/LocationContext.tsx'
import { useColorModeValues } from '../../contexts/DarkModeContext.tsx'
import { useTranslation } from '../../hooks/useTranslation.ts'
import type { ColorMode } from '../../types/types.ts'
import {
  IoSunnyOutline,
  IoCloudOutline,
  IoRainyOutline,
  IoSnowOutline,
  IoThunderstormOutline,
  IoPartlySunnyOutline,
} from 'react-icons/io5'

interface WeatherData {
  temperature: number
  feelsLike: number
  weatherCode: number
}

type WeatherStatus = 'idle' | 'loading' | 'success' | 'error'

interface WeatherState {
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

const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
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

const getWeatherIcon = (code: number, size: number = 32) => {
  // WMO Weather interpretation codes
  if (code === 0) return <IoSunnyOutline size={size} />
  if (code <= 3) return <IoPartlySunnyOutline size={size} />
  if (code <= 48) return <IoCloudOutline size={size} />
  if (code <= 67) return <IoRainyOutline size={size} />
  if (code <= 77) return <IoSnowOutline size={size} />
  if (code <= 99) return <IoThunderstormOutline size={size} />
  return <IoCloudOutline size={size} />
}

const WeatherWidget = () => {
  const { t } = useTranslation()
  const colorModeContext: ColorMode = useColorModeValues()
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
        const data = await fetchWeather(userLocation.latitude!, userLocation.longitude!)
        setCachedWeather(data, userLocation.latitude!, userLocation.longitude!)
        setWeather({ status: 'success', data, error: null })
      } catch {
        setWeather({ status: 'error', data: null, error: 'Failed to fetch weather' })
      }
    }

    fetchData()
  }, [userLocation.latitude, userLocation.longitude])

  // No location - show hint
  if (weather.status === 'idle') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className="text-fluid-xs text-gray-500 dark:text-gray-400 text-center">
          {t('home.hero.weather.noLocation')}
        </p>
      </div>
    )
  }

  // Loading state
  if (weather.status === 'loading') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className="text-fluid-xs text-gray-500 dark:text-gray-400 text-center">
          {t('home.hero.weather.loading')}
        </p>
      </div>
    )
  }

  // Error state
  if (weather.status === 'error') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className="text-fluid-xs text-gray-500 dark:text-gray-400 text-center">
          {t('home.hero.weather.error')}
        </p>
      </div>
    )
  }

  // Success state
  return (
    <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
      <div className="flex items-center gap-2">
        <div className="background-text">
          {getWeatherIcon(weather.data!.weatherCode)}
        </div>
        <div>
          <p className="text-fluid-lg poppins-bold background-text">
            {weather.data!.temperature}°C
          </p>
          <p className="text-fluid-xs text-gray-500 dark:text-gray-400">
            {t('home.hero.weather.feelsLike')} {weather.data!.feelsLike}°C
          </p>
        </div>
      </div>
    </div>
  )
}

export { WeatherWidget }
