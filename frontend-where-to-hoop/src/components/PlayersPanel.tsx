import { useMemo } from 'react'
import { FaUser } from 'react-icons/fa'
import type { ColorMode, PlayerEnrollment } from '../types/types'
import { useColorModeValues } from '../contexts/DarkModeContext'
import { useTranslation } from '../hooks/useTranslation'

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

// Player card component
interface PlayerCardProps {
  enrollment: PlayerEnrollment
}

const PlayerCard = ({ enrollment}: PlayerCardProps) => {
  const arrivalTime = new Date(enrollment.arrivalTime)
  const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)
  const now = new Date()
  const isPlaying = arrivalTime <= now
  const isOpenToPlay = enrollment.playMode === 'open'
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  const handleJoin = () => {
    console.log('Joining player:', enrollment.playerName)
  }

  const noteText = enrollment.note || (isOpenToPlay ? t('hoop.playersPanel.defaultNoteOpen') : t('hoop.playersPanel.defaultNoteSolo'))

  return (
    <div className={`${colorModeContext} flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      <div className="w-8 h-8 shrink-0 rounded-full bg-first-color flex items-center justify-center text-white text-sm font-medium">
        {enrollment.playerName.charAt(0)}
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

// Players panel component
interface PlayersPanelProps {
  playerEnrollments: PlayerEnrollment[]
}

const PlayersPanel: React.FC<PlayersPanelProps> = ({ playerEnrollments }: PlayersPanelProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  /* 
  // Filter out expired enrollments
  const filterActiveEnrollments = (enrollments: PlayerEnrollment[]): PlayerEnrollment[] => {
    const now = new Date()
    return enrollments.filter(enrollment => {
      const endTime = new Date(enrollment.arrivalTime.getTime() + enrollment.duration * 60 * 1000)
      return endTime > now
    })
  }
  */

  // Group enrollments by time status
  const groupEnrollmentsByTime = (enrollments: PlayerEnrollment[]): {
    playingNow: PlayerEnrollment[]
    comingSoon: PlayerEnrollment[] // Within 30 minutes
    comingLater: PlayerEnrollment[] // More than 30 minutes
  } => {
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

    const playingNow: PlayerEnrollment[] = []
    const comingSoon: PlayerEnrollment[] = []
    const comingLater: PlayerEnrollment[] = []

    enrollments.forEach(enrollment => {
      const arrivalTime = new Date(enrollment.arrivalTime)
      const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)

      if (arrivalTime <= now && endTime > now) {
        // Currently at the court
        playingNow.push(enrollment)
      } else if (arrivalTime > now && arrivalTime <= thirtyMinutesFromNow) {
        // Arriving within 30 minutes
        comingSoon.push(enrollment)
      } else if (arrivalTime > thirtyMinutesFromNow) {
        // Arriving later
        comingLater.push(enrollment)
      }
    })

    // Sort each group by arrival time
    playingNow.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
    comingSoon.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
    comingLater.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())

    return { playingNow, comingSoon, comingLater }
  }

  const { playingNow, comingSoon, comingLater } = useMemo(
    () => groupEnrollmentsByTime(playerEnrollments),
    [playerEnrollments]
  )

  const renderPlayerGroup = (title: string, players: PlayerEnrollment[]) => {
    if (players.length === 0) return null

    return (
      <div className="mb-4">
        <h4 className={`${colorModeContext} text-fluid-sm font-semibold background-text mb-2`}>
          {title} ({players.length})
        </h4>
        <div className="flex flex-col gap-2">
          {players.map(player => (
            <PlayerCard
              key={player.id}
              enrollment={player}
            />
          ))}
        </div>
      </div>
    )
  }

  const totalPlayers = playingNow.length + comingSoon.length + comingLater.length

  return (
    <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <FaUser className="text-first-color" />
        <h3 className={`${colorModeContext} text-fluid-lg font-semibold background-text`}>
          {t('hoop.playersPanel.title')}
        </h3>
      </div>

      {totalPlayers === 0 ? (
        <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400 text-center py-4`}>
          {t('hoop.playersPanel.noPlayers')}
        </p>
      ) : (
        <>
          {renderPlayerGroup(t('hoop.playersPanel.playingNow'), playingNow)}
          {renderPlayerGroup(t('hoop.playersPanel.comingSoon'), comingSoon)}
          {renderPlayerGroup(t('hoop.playersPanel.comingLater'), comingLater)}
        </>
      )}
    </div>
  )
}

export { PlayersPanel }
