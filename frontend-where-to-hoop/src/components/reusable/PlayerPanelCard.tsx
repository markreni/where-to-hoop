import { useState } from 'react'
import type { ColorMode, Coordinates, PlayerEnrollment } from '../../types/types'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuth } from '../../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../contexts/ToastContext'
import { deleteEnrollment, insertEnrollment, verifyEnrollment } from '../../services/requests'
import { Button } from 'react-aria-components'
import { Link } from 'react-router-dom'
import { isWithinHoopRange } from '../../utils/functions'
import { getSessionEndTime } from '../../utils/time'
import { hasEnrollmentInSameDayBucket } from '../../utils/enrollments'
import { MdCheckCircle, MdHourglassEmpty } from 'react-icons/md'
import { VERIFY_RANGE_METERS, VERIFY_WINDOW_START_OFFSET_MS, VERIFY_WINDOW_END_OFFSET_MS } from '../../utils/constants'

const getCurrentPositionAsync = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) { // if the browser doesn't support geolocation at all
      reject(new Error('geolocation-unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })

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

interface PlayerPanelCardProps {
  enrollment: PlayerEnrollment
  hoopEnrollments: PlayerEnrollment[]
  hoopCoordinates: Coordinates
}

const PlayerPanelCard = ({ enrollment, hoopEnrollments, hoopCoordinates }: PlayerPanelCardProps) => {
  const arrivalTime: Date = new Date(enrollment.arrivalTime)
  const endTime: Date = getSessionEndTime(arrivalTime, enrollment.duration)
  const now: Date = new Date()
  const isPlaying: boolean = arrivalTime <= now
  const isOpenToPlay = enrollment.playMode === 'open'
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const isOwner = !!user && user.id === enrollment.playerId
  const [isJoining, setIsJoining] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const nowMs: number = now.getTime()
  const arrivalMs: number = arrivalTime.getTime()
  const verifyWindowOpen: boolean =
    !enrollment.verified &&
    nowMs >= arrivalMs - VERIFY_WINDOW_START_OFFSET_MS &&
    nowMs <= arrivalMs + VERIFY_WINDOW_END_OFFSET_MS

  const handleVerify = async () => {
    if (!hoopCoordinates || !hoopCoordinates.latitude || !hoopCoordinates.longitude) return
    setIsVerifying(true)
    try {
      const position: GeolocationPosition = await getCurrentPositionAsync()
      const userLat = position.coords.latitude
      const userLng = position.coords.longitude
      const { within, distance } = isWithinHoopRange(
        [userLat, userLng],
        [hoopCoordinates.latitude, hoopCoordinates.longitude],
        VERIFY_RANGE_METERS
      )

      if (!within) {
        error(
          t('hoop.playersPanel.verifyOutOfRange', {
            distance: Math.round(distance),
            range: VERIFY_RANGE_METERS,
          })
        )
        return
      }

      await verifyEnrollment(enrollment.id, { lat: userLat, lng: userLng })
      success(t('hoop.playersPanel.verifySuccess'))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['activeEnrollments', user?.id], exact: true }),
      ])
    } catch (err) {
      const geoErr = err as GeolocationPositionError & { code?: number; message?: string } // intersection making code and message properties optional, since err might not actually be a GeolocationPositionError (it could be a Supabase error or anything else thrown in the try block)
      if (geoErr && typeof geoErr.code === 'number' && geoErr.code === 1) {
        error(
          `${t('hoop.playersPanel.verifyGeoDenied')} (${t('hoop.playersPanel.verifyGeoDeniedHelp')}: https://support.google.com/chrome/answer/142065)`
        )
      } else {
        error(t('hoop.playersPanel.verifyError'))
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const alreadyEnrolled: boolean = !!user && hasEnrollmentInSameDayBucket(hoopEnrollments, user.id, enrollment)
  const joinDisabled: boolean = !user || isJoining || alreadyEnrolled

  const handleJoinSubmit = () => {
    if (!user || alreadyEnrolled) return
    setIsJoining(true)
    insertEnrollment({
      playerId: user.id,
      playerNickname: user.user_metadata?.nickname ?? '',
      hoopId: enrollment.hoopId,
      arrivalTime: enrollment.arrivalTime,
      duration: enrollment.duration,
      expired: enrollment.expired,
      playMode: enrollment.playMode,
      note: `Joined ${enrollment.playerNickname}`,
    }).then(async () => {
      success(t('hoop.enrollment.success'))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['activeEnrollments', user.id], exact: true }),
      ])
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
    if (!user) return
    deleteEnrollment(enrollment.id).then(async () => {
      success(t('hoop.playersPanel.deleteSuccess'))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['activeEnrollments', user.id], exact: true }),
      ])
    }).catch(() => {
      error(t('hoop.playersPanel.deleteError'))
    })
  }

  const noteText = enrollment.note || (isOpenToPlay ? t('hoop.playersPanel.defaultNoteOpen') : t('hoop.playersPanel.defaultNoteSolo'))

  return (
    <div className={`${colorModeContext} flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      {/*
      <div className="w-8 h-8 shrink-0 rounded-full bg-first-color flex items-center justify-center text-white text-sm font-medium">
        {enrollment.playerNickname.charAt(0).toUpperCase()}
      </div>
      */}
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <Link
          to={`/players/${enrollment.playerNickname.toLowerCase()}`}
          title={enrollment.playerNickname}
          className={`${colorModeContext} text-fluid-sm font-semibold text-first-color hover:text-second-color truncate w-fit max-w-full`}
        >
          @{enrollment.playerNickname}
        </Link>
        <div className="flex items-start gap-x-2 gap-y-0.5 flex-wrap">
          <b><p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
            {isPlaying
              ? `${t('hoop.playersPanel.untilText')} ${formatTime(endTime)} ${t('hoop.playersPanel.untilText2')}`
              : formatArrivalText(arrivalTime, t)
            }
          </p></b>
          {enrollment.verified ? (
            <span
              title={t('hoop.playersPanel.verifiedLabel')}
              className={`${colorModeContext} inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-fluid-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}
            >
              <MdCheckCircle size={12} />
              {t('hoop.playersPanel.verifiedLabel')}
            </span>
          ) : (
            <span
              title={t('hoop.playersPanel.unverifiedLabel')}
              className={`${colorModeContext} inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-fluid-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300`}
            >
              <MdHourglassEmpty size={12} />
              {t('hoop.playersPanel.unverifiedLabel')}
            </span>
          )}
        </div>
        <p className={`${colorModeContext} text-fluid-xs background-text break-words`}>
          {noteText}
        </p>
      </div>
      {isOwner ? (
        <div className="flex flex-col gap-3.5 shrink-0">
          {verifyWindowOpen && hoopCoordinates && (
            <Button
              onClick={handleVerify}
              isDisabled={isVerifying}
              className={`px-3 py-1 text-fluid-xs font-medium rounded-full text-white transition-all shadow-sm hover:shadow-md active:shadow-none active:scale-95 active:brightness-90 ${
                isVerifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
              }`}
            >
              {t('hoop.playersPanel.verifyButton')}
            </Button>
          )}
          {!enrollment.verified && (
            <Button
              onClick={handleDelete}
              className="px-3 py-1 text-fluid-xs font-medium rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm hover:shadow-md active:shadow-none active:scale-95 active:brightness-90 cursor-pointer"
            >
              {t('hoop.playersPanel.deleteButton')}
            </Button>
          )}
        </div>
      ) : (
        isOpenToPlay && user && (
          <Button
            onClick={handleJoinSubmit}
            isDisabled={joinDisabled}
            className={`shrink-0 px-3 py-1 text-fluid-xs font-medium rounded-full text-white transition-all shadow-sm hover:shadow-md active:shadow-none active:scale-95 active:brightness-90 ${
              joinDisabled
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

export { PlayerPanelCard }
export type { PlayerPanelCardProps }
