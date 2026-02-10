import { useColorModeValues } from '../../contexts/ColorModeContext.tsx'
import { useTranslation } from '../../hooks/useTranslation.ts'
import { useWeather } from '../../hooks/useWeather.ts'
import type { ColorMode } from '../../types/types.ts'
import {
  IoSunnyOutline,
  IoCloudOutline,
  IoRainyOutline,
  IoSnowOutline,
  IoThunderstormOutline,
  IoPartlySunnyOutline,
} from 'react-icons/io5'

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
  const weather = useWeather()

  // No location - show hint
  if (weather.status === 'idle') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 text-center`}>
          {t('home.hero.weather.noLocation')}
        </p>
      </div>
    )
  }

  // Loading state
  if (weather.status === 'loading') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 text-center`}>
          {t('home.hero.weather.loading')}
        </p>
      </div>
    )
  }

  // Error state
  if (weather.status === 'error') {
    return (
      <div className={`${colorModeContext} p-3 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[140px]`}>
        <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 text-center`}>
          {t('home.hero.weather.error')}
        </p>
      </div>
    )
  }

  // Success state
  return (
    <div className={`${colorModeContext} p-3 rounded-lg bg-gray-200/60 border border-1 background-border min-w-[140px] dark:bg-gray-800`}>
      <div className="flex items-center gap-2">
        <div className={`${colorModeContext} background-text`}>
          {getWeatherIcon(weather.data!.weatherCode)}
        </div>
        <div>
          <p className={`${colorModeContext} text-fluid-lg poppins-bold background-text`}>
            {weather.data!.temperature}°C
          </p>
          <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
            {t('home.hero.weather.feelsLike')} {weather.data!.feelsLike}°C
          </p>
        </div>
      </div>
    </div>
  )
}

export { WeatherWidget }
