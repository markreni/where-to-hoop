import { useState } from 'react'
import { Button } from 'react-aria-components'
import { FaClock, FaUsers, FaUser } from 'react-icons/fa'
import type { ColorMode, PlayerEnrollment, PlayMode } from '../types/types'
import { useColorModeValues } from '../contexts/DarkModeContext'
import { useTranslation } from '../hooks/useTranslation'

interface EnrollmentFormProps {
  hoopId: string
}

const EnrollmentForm = ({ hoopId }: EnrollmentFormProps) => {
  const [arrivalMinutes, setArrivalMinutes] = useState(0) // 0-180 in 15 min increments
  const [durationMinutes, setDurationMinutes] = useState(60) // 30-180 in 30 min increments
  const [playMode, setPlayMode] = useState<PlayMode>('open')
  const [note, setNote] = useState('')
  const [userEnrollment, setUserEnrollment] = useState<PlayerEnrollment | null>(null)
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  const MAX_NOTE_LENGTH = 100

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

  const handleEnroll = () => {
    const now = new Date()
    const enrollment: PlayerEnrollment = {
      id: `user-${Date.now()}`,
      playerName: 'You',
      hoopId,
      arrivalTime: new Date(now.getTime() + arrivalMinutes * 60 * 1000),
      duration: durationMinutes,
      playMode,
      ...(note.trim() && { note: note.trim() }),
      createdAt: now,
    }
    console.log('Enrolled with:', enrollment)
    setUserEnrollment(enrollment)
  }

  const onCancel = () => {
    setUserEnrollment(null)
  }

  if (userEnrollment) {
    return (
      <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <FaClock className="text-first-color" />
          <h3 className={`${colorModeContext} text-fluid-lg font-semibold background-text`}>
            {t('hoop.enrollment.title')}
          </h3>
        </div>

        <div className={`${colorModeContext} bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-4`}>
          <p className={`${colorModeContext} text-fluid-sm text-green-800 dark:text-green-200`}>
            {t('hoop.enrollment.success')}
          </p>
        </div>

        <Button
          onPress={onCancel}
          className={`${colorModeContext} w-full py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer`}
        >
          {t('hoop.enrollment.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <FaClock className="text-first-color" />
        <h3 className={`${colorModeContext} text-fluid-lg font-semibold background-text`}>
          {t('hoop.enrollment.title')}
        </h3>
      </div>

      {/* Arrival time slider */}
      <div className="mb-6">
        <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
          {t('hoop.enrollment.arriveIn')}: <span className="text-first-color">{formatSliderValue(arrivalMinutes, true)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="720"
          step="30"
          value={arrivalMinutes}
          onChange={(e) => setArrivalMinutes(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-first-color"
        />
        <div className="flex justify-between text-fluid-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{t('hoop.enrollment.now')}</span>
          <span>3{t('hoop.enrollment.hours')}</span>
        </div>
      </div>

      {/* Duration slider */}
      <div className="mb-6">
        <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
          {t('hoop.enrollment.playFor')}: <span className="text-first-color">{formatSliderValue(durationMinutes, false)}</span>
        </label>
        <input
          type="range"
          min="30"
          max="300"
          step="30"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-first-color"
        />
        <div className="flex justify-between text-fluid-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>30{t('hoop.enrollment.minutes')}</span>
          <span>3{t('hoop.enrollment.hours')}</span>
        </div>
      </div>

      {/* Play mode selector */}
      <div className="mb-6">
        <label className={`${colorModeContext} block text-fluid-sm font-medium background-text mb-2`}>
          {t('hoop.enrollment.playModeLabel')}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlayMode('open')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-colors cursor-pointer ${
              playMode === 'open'
                ? 'border-first-color bg-first-color/10 text-first-color'
                : 'border-gray-300 dark:border-gray-600 form-button-text hover:border-gray-400'
            }`}
          >
            <FaUsers size={16} />
            <span className="text-fluid-sm font-medium">{t('hoop.enrollment.openToPlay')}</span>
          </button>
          <button
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
          </button>
        </div>
      </div>

      {/* Note field */}
      <div className="mb-6">
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

      <Button
        onPress={handleEnroll}
        className={`${colorModeContext} w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors cursor-pointer`}
      >
        {t('hoop.enrollment.enroll')}
      </Button>
    </div>
  )
}

export { EnrollmentForm }
export type { EnrollmentFormProps }
