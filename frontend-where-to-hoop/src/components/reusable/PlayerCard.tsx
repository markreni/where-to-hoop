import type { ColorMode, PlayerEnrollment } from '../../types/types'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'

// Helper to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Helper to format arrival text
const formatArrivalText = (arrivalTime: Date, t: (key: string) => string): string => {
  const now = new Date()
  const diffMs = arrivalTime.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins <= 0) {
    return t('hoop.enrollment.now')
  } else if (diffMins < 60) {
    return `${t('hoop.playersPanel.inText')} ${diffMins} ${t('hoop.playersPanel.minutesShort')}`
  } else {
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${t('hoop.playersPanel.inText')} ${hours}${t('hoop.enrollment.hours')} ${mins}${t('hoop.enrollment.minutes')}`
  }
}

interface PlayerCardProps {
  enrollment: PlayerEnrollment
}

const PlayerCard = ({ enrollment }: PlayerCardProps) => {
  const arrivalTime = new Date(enrollment.arrivalTime)
  const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)
  const now = new Date()
  const isPlaying = arrivalTime <= now
  const isOpenToPlay = enrollment.playMode === 'open'
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  const handleJoin = () => {
    console.log('Joining player:', enrollment.player.nickname)
  }

  const noteText = enrollment.note || (isOpenToPlay ? t('hoop.playersPanel.defaultNoteOpen') : t('hoop.playersPanel.defaultNoteSolo'))

  return (
    <div className={`${colorModeContext} flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      <div className="w-8 h-8 shrink-0 rounded-full bg-first-color flex items-center justify-center text-white text-sm font-medium">
        {enrollment.player.nickname.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <b><p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
          {isPlaying
            ? `${t('hoop.playersPanel.untilText')} ${formatTime(endTime)}`
            : formatArrivalText(arrivalTime, t)
          }
        </p></b>
        <p className={`${colorModeContext} text-fluid-xs background-text`}>
          {noteText}
        </p>
      </div>
      {isOpenToPlay && (
        <button
          onClick={handleJoin}
          className="shrink-0 px-3 py-1 text-fluid-xs font-medium rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer"
        >
          {t('hoop.playersPanel.joinButton')}
        </button>
      )}
    </div>
  )
}

export { PlayerCard }
export type { PlayerCardProps }
