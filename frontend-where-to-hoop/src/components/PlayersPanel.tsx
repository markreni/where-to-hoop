import { useMemo } from 'react'
import { FaUser } from 'react-icons/fa'
import type { ColorMode, PlayerEnrollment } from '../types/types'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { PlayerCard } from './reusable/PlayerCard'
import { groupEnrollmentsByTime } from '../utils/functions'
  
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

  const renderPlayerGroup = (title: string, enrollments: PlayerEnrollment[]) => {
    if (enrollments.length === 0) return null

    return (
      <div className="mb-4">
        <h4 className={`${colorModeContext} text-fluid-sm font-semibold background-text mb-2`}>
          {title} ({enrollments.length})
        </h4>
        <div className="flex flex-col gap-2">
          {enrollments.map(enrollment => (
            <PlayerCard
              key={enrollment.id}
              enrollment={enrollment}
            />
          ))}
        </div>
      </div>
    )
  }

  const totalPlayers = playingNow.length + comingSoon.length + comingLater.length

  return (
    <div id="players" className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
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
