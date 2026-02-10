import { FaSun, FaCloudSun, FaMoon, FaStar } from 'react-icons/fa'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import type { ColorMode, TimeSlot } from '../../types/types'

interface TimeSlotPickerProps {
  selectedSlot: TimeSlot | null
  onSlotChange: (slot: TimeSlot) => void
}

const TIME_SLOTS: { id: TimeSlot; icon: React.ReactNode; startHour: number }[] = [
  { id: 'morning', icon: <FaSun size={18} />, startHour: 8 },
  { id: 'afternoon', icon: <FaCloudSun size={18} />, startHour: 12 },
  { id: 'evening', icon: <FaMoon size={18} />, startHour: 17 },
  { id: 'night', icon: <FaStar size={18} />, startHour: 21 },
]

const TimeSlotPicker = ({ selectedSlot, onSlotChange }: TimeSlotPickerProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-2">
      {TIME_SLOTS.map(({ id, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSlotChange(id)}
          className={`${colorModeContext} flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition-colors cursor-pointer ${
            selectedSlot === id
              ? 'border-first-color bg-first-color/10 text-first-color'
              : 'border-gray-300 dark:border-gray-600 form-button-text hover:border-gray-400'
          }`}
        >
          {icon}
          <span className="text-fluid-sm font-medium">
            {t(`hoop.enrollment.timeSlots.${id}`)}
          </span>
          <span className="text-fluid-xs text-gray-500 dark:text-gray-400">
            {t(`hoop.enrollment.timeSlots.${id}Range`)}
          </span>
        </button>
      ))}
    </div>
  )
}

export { TimeSlotPicker, TIME_SLOTS }
export type { TimeSlotPickerProps }
