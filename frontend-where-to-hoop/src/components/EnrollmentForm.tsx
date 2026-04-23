import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { insertEnrollment, deleteEnrollment } from '../services/requests'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from 'react-aria-components'
import { FaClock, FaUsers, FaUser, FaExclamationCircle } from 'react-icons/fa'
import type { ColorMode, PlayerEnrollment, PlayMode, TimeSlot } from '../types/types'
import type { DateValue } from 'react-aria-components'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { MAX_NOTE_LENGTH } from '../utils/constants'
import { EnrollmentCalendar } from './reusable/EnrollmentCalendar'
import InfoLink from './reusable/InfoLink'
import { TimeSlotPicker } from './reusable/TimeSlotPicker'
import { getLocalTimeZone } from '@internationalized/date'
import { getTimeSlotStartHour, isTodayDate } from '../utils/functions'

type WhenMode = 'today' | 'later'

interface EnrollmentFormProps {
  hoopId: string
  enrollments: PlayerEnrollment[]
}

const getMaxArrivalMinutes = (): number => {
  const now = new Date()
  const minutesUntilMidnight = (23 - now.getHours()) * 60 + (60 - now.getMinutes())
  return Math.min(Math.floor(minutesUntilMidnight / 30) * 30, 720)
}

const EnrollmentForm = ({ hoopId, enrollments }: EnrollmentFormProps) => {
  const [whenMode, setWhenMode] = useState<WhenMode>('today')
  const maxArrivalMinutes = getMaxArrivalMinutes()
  const [arrivalMinutes, setArrivalMinutes] = useState(0) // 0-maxArrivalMinutes in 30 min increments
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [durationMinutes, setDurationMinutes] = useState(60) // 30-300 in 30 min increments
  const [playMode, setPlayMode] = useState<PlayMode>('open')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  // Local state for optimistic UI after submit (clears once query re-fetches)
  const [localTodayEnrollment, setLocalTodayEnrollment] = useState<PlayerEnrollment | null>(null)
  const [localLaterEnrollment, setLocalLaterEnrollment] = useState<PlayerEnrollment | null>(null)
  const localTodayEnrollmentRef = useRef(localTodayEnrollment)
  const localLaterEnrollmentRef = useRef(localLaterEnrollment)
  localTodayEnrollmentRef.current = localTodayEnrollment
  localLaterEnrollmentRef.current = localLaterEnrollment
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const todayEnrollment: PlayerEnrollment | null =
    localTodayEnrollment ??
    enrollments.find(e => e.playerId === user?.id && isTodayDate(e.arrivalTime)) ??
    null

  const laterEnrollment: PlayerEnrollment | null =
    localLaterEnrollment ??
    enrollments.find(e => e.playerId === user?.id && !isTodayDate(e.arrivalTime) && e.arrivalTime > new Date()) ??
    null

  // Sync local optimistic state with server — clears if enrollment was deleted elsewhere (e.g. PlayerCard)
  // Uses refs so this only triggers when enrollments changes, not when local state changes.
  // This prevents clearing local state before the query has had a chance to re-fetch.
  useEffect(() => {
    if (localTodayEnrollmentRef.current && !enrollments.some(e => e.id === localTodayEnrollmentRef.current!.id)) {
      setLocalTodayEnrollment(null)
      setNote('') 
    }
    if (localLaterEnrollmentRef.current && !enrollments.some(e => e.id === localLaterEnrollmentRef.current!.id)) {
      setLocalLaterEnrollment(null)
      setNote('') 
    }
  }, [enrollments])

  const formatSliderValue = (minutes: number, isArrival: boolean): string => {
    if (isArrival && minutes === 0) return t('hoop.enrollment.now')

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins} ${t('hoop.enrollment.minutes')}`
    } else if (mins === 0) {
      return `${hours} ${t('hoop.enrollment.hours')}`
    }
    return `${hours}${t('hoop.enrollment.hours')} ${mins}${t('hoop.enrollment.minutes')}`
  }

  const calculateArrivalTime = (): Date => {
    const now = new Date()

    if (whenMode === 'today') {
      return new Date(now.getTime() + arrivalMinutes * 60 * 1000)
    } else {
      // "Later" mode - use selected date and time slot
      if (!selectedDate || !selectedTimeSlot) {
        return now // Fallback, shouldn't happen if form validation works
      }

      const arrivalDate = selectedDate.toDate(getLocalTimeZone())
      const startHour = getTimeSlotStartHour(selectedTimeSlot)
      arrivalDate.setHours(startHour, 0, 0, 0)
      return arrivalDate
    }
  }

  const handleEnrollSubmit = () => {
    setIsSubmitting(true)
    insertEnrollment({
      playerId: user!.id,
      playerNickname: user!.user_metadata?.nickname ?? '',
      hoopId,
      arrivalTime: calculateArrivalTime(),
      duration: durationMinutes,
      expired: false,
      playMode,
      ...(note.trim() && { note: note.trim() }),
    }).then(async (inserted) => {
      if (whenMode === 'today') {
        setLocalTodayEnrollment(inserted)
      } else {
        setLocalLaterEnrollment(inserted)
      }
      success(t('hoop.enrollment.success'))
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    }).catch((err: { code?: string }) => {
      if (err.code === '42501') {
        error(t('hoop.enrollment.authError'))
      } else {
        error(t('hoop.enrollment.error'))
      }
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  const isLaterModeValid = whenMode === 'later' ? (selectedDate !== null && selectedTimeSlot !== null) : true
  const isEnrollEnabled = !!user && isLaterModeValid && !isSubmitting

  const onCancel = (enrollment: PlayerEnrollment, mode: WhenMode) => {
    setIsCancelling(true)
    deleteEnrollment(enrollment.id).then(async () => {
      if (mode === 'today') {
        setLocalTodayEnrollment(null)
      } else {
        setLocalLaterEnrollment(null)
      }
      setNote('')
      success(t('hoop.playersPanel.deleteSuccess'))
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    }).catch(() => {
      error(t('hoop.playersPanel.deleteError'))
    }).finally(() => {
      setIsCancelling(false)
    })
  }

  const activeEnrollment: PlayerEnrollment | null = whenMode === 'today' ? todayEnrollment : laterEnrollment

  return (
    <div className={`${colorModeContext} flex flex-col gap-6 bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaClock className="text-first-color" />
            <h3 className={`${colorModeContext} text-fluid-lg font-semibold background-text`}>
              {t('hoop.enrollment.title')}
            </h3>
          </div>
          <InfoLink sectionId="ready-to-play" />
        </div>

        <div className="flex items-center gap-1.5 mb-4 text-gray-500 dark:text-gray-400">
          <FaExclamationCircle size={12} />
          <span className="text-fluid-xs">{t('hoop.enrollment.courtsOpenNote')}</span>
        </div>
      </div>

      {/* When mode toggle - prominent heading style */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setWhenMode('today')}
          className={`flex-1 pb-3 text-fluid-base font-semibold transition-colors cursor-pointer ${
            whenMode === 'today'
              ? 'text-first-color border-b-2 border-first-color -mb-1px'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {t('hoop.enrollment.today')}
        </button>
        <button
          type="button"
          onClick={() => setWhenMode('later')}
          className={`flex-1 pb-3 text-fluid-base font-semibold transition-colors cursor-pointer ${
            whenMode === 'later'
              ? 'text-first-color border-b-2 border-first-color -mb-1px'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {t('hoop.enrollment.later')}
        </button>
      </div>

      {activeEnrollment ? (
        /* Already enrolled in this mode */
        <div className={`${colorModeContext} bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4`}>
          <p className={`${colorModeContext} text-fluid-sm text-green-800 dark:text-green-200 mb-3`}>
            {t('hoop.enrollment.success')}
          </p>
          <Button
            onPress={() => onCancel(activeEnrollment, whenMode)}
            isDisabled={isCancelling}
            className={`${colorModeContext} w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              isCancelling ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'
            }`}
          >
            {t('hoop.enrollment.cancel')}
          </Button>
        </div>
      ) : (
        <>
          {whenMode === 'today' ? (
            /* Arrival time slider - Today mode */
            <div>
              <div>
                <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
                  {t('hoop.enrollment.arriveIn')}: <span className="text-first-color">{formatSliderValue(arrivalMinutes, true)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxArrivalMinutes}
                  step="30"
                  value={arrivalMinutes}
                  onChange={(e) => setArrivalMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-first-color"
                />
                <div className="flex justify-between text-fluid-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{t('hoop.enrollment.now')}</span>
                  <span>{formatSliderValue(maxArrivalMinutes, false)}</span>
                </div>
              </div>
              {/* Duration slider */}
              <div>
                <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
                  {t('hoop.enrollment.playFor')}: <span className="text-first-color">{formatSliderValue(durationMinutes, false)}</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="720"
                  step="30"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-first-color"
                />
                <div className="flex justify-between text-fluid-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>30{t('hoop.enrollment.minutes')}</span>
                  <span>12{t('hoop.enrollment.hours')}</span>
                </div>
              </div>
            </div>

          ) : (
            /* Calendar and time slot - Later mode */
            <div>
              <div>
                <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
                  {t('hoop.enrollment.selectDate')}
                </label>
                <EnrollmentCalendar
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>

              <div>
                <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
                  {t('hoop.enrollment.selectTime')}
                </label>
                <TimeSlotPicker
                  selectedSlot={selectedTimeSlot}
                  onSlotChange={setSelectedTimeSlot}
                />
              </div>
            </div>
          )}

          {/* Play mode selector */}
          <div>
            <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
              {t('hoop.enrollment.playModeLabel')}
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setPlayMode('open')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  playMode === 'open'
                    ? 'border-first-color bg-first-color/10 text-first-color'
                    : 'border-gray-300 dark:border-gray-600 form-button-text hover:border-gray-400'
                }`}
              >
                <FaUsers size={16} />
                <span className="text-fluid-xs xsm:text-fluid-sm font-medium">{t('hoop.enrollment.openToPlay')}</span>
              </Button>
              <Button
                type="button"
                onClick={() => setPlayMode('solo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  playMode === 'solo'
                    ? 'border-first-color bg-first-color/10 text-first-color'
                    : 'border-gray-300 dark:border-gray-600 form-button-text hover:border-gray-400'
                }`}
              >
                <FaUser size={14} />
                <span className="text-fluid-sm font-medium">{t('hoop.enrollment.soloHooping')}</span>
              </Button>
            </div>
          </div>

          {/* Note field */}
          <div>
            <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
              {t('hoop.enrollment.noteLabel')} <span className="text-gray-400 font-normal">({t('hoop.enrollment.optional')})</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              placeholder={t('hoop.enrollment.notePlaceholder')}
              rows={2}
              className={`${colorModeContext} form-input`}
            />
            <div className="flex justify-end text-fluid-xs text-gray-400 mt-1">
              {note.length}/{MAX_NOTE_LENGTH}
            </div>
          </div>

          {user ? (
            <Button
              onPress={handleEnrollSubmit}
              isDisabled={!isEnrollEnabled}
              className={`${colorModeContext} w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isEnrollEnabled
                  ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {t('hoop.enrollment.enroll')}
            </Button>
          ) : (
            <Button
              onPress={() => navigate('/signin')}
              className={`${colorModeContext} w-full py-3 px-4 rounded-lg text-white font-medium bg-first-color hover:bg-second-color transition-colors cursor-pointer`}
            >
              {t('hoop.enrollment.signInToCheckIn')}
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export { EnrollmentForm }
export type { EnrollmentFormProps }
