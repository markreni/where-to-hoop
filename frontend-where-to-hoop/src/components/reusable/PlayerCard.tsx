import { useState } from 'react'
import type { ColorMode, PlayerEnrollment } from '../../types/types'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuth } from '../../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../contexts/ToastContext'
import { deleteEnrollment, insertEnrollment } from '../../utils/requests'
import { Button } from 'react-aria-components'
import { isTodayDate } from '../../utils/functions'

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
  allEnrollments: PlayerEnrollment[]
}

const PlayerCard = ({ enrollment, allEnrollments }: PlayerCardProps) => {
  const arrivalTime = new Date(enrollment.arrivalTime)
  const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)
  const now = new Date()
  const isPlaying = arrivalTime <= now
  const isOpenToPlay = enrollment.playMode === 'open'
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const isOwner = !!user && user.id === enrollment.playerId
  const [isJoining, setIsJoining] = useState(false)

  const enrollmentIsToday = isTodayDate(arrivalTime)
  const alreadyEnrolled: boolean = !!user && allEnrollments.some(e =>
    e.playerId === user.id &&
    (enrollmentIsToday ? isTodayDate(new Date(e.arrivalTime)) : !isTodayDate(new Date(e.arrivalTime)))
  )

  const handleJoinSubmit = () => {
    if (!user || alreadyEnrolled) return
    setIsJoining(true)
    insertEnrollment({
      playerId: user.id,
      playerNickname: user.user_metadata?.nickname ?? '',
      hoopId: enrollment.hoopId,
      arrivalTime: enrollment.arrivalTime,
      duration: enrollment.duration,
      playMode: enrollment.playMode,
      note: `Joined ${enrollment.playerNickname}`,
    }).then(async () => {
      success(t('hoop.enrollment.success'))
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    }).catch((err: { code?: string }) => {
      if (err.code === '42501') {
        error(t('hoop.enrollment.authError'))
      } else {
        error(t('hoop.enrollment.error'))
      }
    }).finally(() => {
      setIsJoining(false)
    })
  }

  const handleDelete = () => {
    deleteEnrollment(enrollment.id).then(async () => {
      success(t('hoop.playersPanel.deleteSuccess'))
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    }).catch(() => {
      error(t('hoop.playersPanel.deleteError'))
    })
  }

  const noteText = enrollment.note || (isOpenToPlay ? t('hoop.playersPanel.defaultNoteOpen') : t('hoop.playersPanel.defaultNoteSolo'))

  return (
    <div className={`${colorModeContext} flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      <div className="w-8 h-8 shrink-0 rounded-full bg-first-color flex items-center justify-center text-white text-sm font-medium">
        {enrollment.playerNickname.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <b><p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
          {isPlaying
            ? `${t('hoop.playersPanel.untilText')} ${formatTime(endTime)}`
            : formatArrivalText(arrivalTime, t)
          }
        </p></b>
        <p className={`${colorModeContext} text-fluid-xs background-text break-words`}>
          {noteText}
        </p>
      </div>
      {isOwner ? (
        <Button
          onClick={handleDelete}
          className="shrink-0 px-3 py-1 text-fluid-xs font-medium rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
        >
          {t('hoop.playersPanel.deleteButton')}
        </Button>
      ) : (
        isOpenToPlay && (
          <Button
            onClick={handleJoinSubmit}
            isDisabled={!user || isJoining || alreadyEnrolled}
            className={`shrink-0 px-3 py-1 text-fluid-xs font-medium rounded-full text-white transition-colors ${
              !user || isJoining || alreadyEnrolled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 cursor-pointer'
            }`}
          >
            {t('hoop.playersPanel.joinButton')}
          </Button>
        )
      )}
    </div>
  )
}

export { PlayerCard }
export type { PlayerCardProps }
