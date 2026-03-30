import { Link } from 'react-router-dom'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import type { BasketballHoop, ColorMode, PlayerEnrollment } from '../../types/types'

interface EnrollmentCardProps {
  enrollment: PlayerEnrollment
  hoops: BasketballHoop[]
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const formatArrival = (date: Date): string =>
  date.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const EnrollmentCard = ({ enrollment, hoops }: EnrollmentCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  const hoopName = enrollment.hoopId
    ? (hoops.find(h => h.id === enrollment.hoopId)?.name ?? t('myProfile.courtUnknown'))
    : t('myProfile.courtUnknown')

  return (
    <div className={`${colorModeContext} bg-background rounded-lg p-4 flex flex-col gap-1.5 shadow-sm border background-border`}>
      <div className="flex items-start justify-between gap-2">
        {enrollment.hoopId ? (
          <Link
            to={`/hoops/${enrollment.hoopId}`}
            className="text-first-color hover:text-second-color font-medium text-fluid-base leading-tight"
          >
            {hoopName}
          </Link>
        ) : (
          <span className={`${colorModeContext} background-text font-medium text-fluid-sm`}>
            {hoopName}
          </span>
        )}
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
          enrollment.playMode === 'open'
            ? `${colorModeContext} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`
            : `${colorModeContext} bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300`
        }`}>
          {enrollment.playMode === 'open' ? t('myProfile.playModeOpen') : t('myProfile.playModeSolo')}
        </span>
      </div>
      <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
        {formatArrival(enrollment.arrivalTime)} - {formatDuration(enrollment.duration)}
      </p>
      {enrollment.note && (
        <p className={`${colorModeContext} text-fluid-xs background-text italic opacity-70`}>
          "{enrollment.note}"
        </p>
      )}
    </div>
  )
}

export { EnrollmentCard }
