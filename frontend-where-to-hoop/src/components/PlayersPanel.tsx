import { useMemo } from 'react'
import { FaUser } from 'react-icons/fa'
import type { ColorMode, PlayerEnrollment } from '../types/types'
import { useColorModeValues } from '../contexts/DarkModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { PlayerCard } from './reusable/PlayerCard'

// Group enrollments by time status
const groupEnrollmentsByTime = (enrollments: PlayerEnrollment[]): {
  playingNow: PlayerEnrollment[]
  comingSoon: PlayerEnrollment[] // Coming later today
  comingLater: PlayerEnrollment[] // Coming on a future day
} => {
  const now = new Date()

  // Get end of today (midnight)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const playingNow: PlayerEnrollment[] = []
  const comingSoon: PlayerEnrollment[] = []
  const comingLater: PlayerEnrollment[] = []

  enrollments.forEach(enrollment => {
    const arrivalTime = new Date(enrollment.arrivalTime)
    const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)

    if (arrivalTime <= now && endTime > now) {
      // Currently at the court
      playingNow.push(enrollment)
    } else if (arrivalTime > now && arrivalTime <= endOfToday) {
      // Arriving later today
      comingSoon.push(enrollment)
    } else if (arrivalTime > endOfToday) {
      // Arriving on a future day
      comingLater.push(enrollment)
    }
  })

  // Sort each group by arrival time
  playingNow.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
  comingSoon.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
  comingLater.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())

  return { playingNow, comingSoon, comingLater }
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
export type { PlayersPanelProps };
