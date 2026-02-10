import {
  Calendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  Heading,
  Button,
} from 'react-aria-components'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import type { ColorMode } from '../../types/types'
import type { DateValue } from 'react-aria-components'
import { today, getLocalTimeZone } from '@internationalized/date'

interface EnrollmentCalendarProps {
  selectedDate: DateValue | null
  onDateChange: (date: DateValue) => void
}

const EnrollmentCalendar = ({ selectedDate, onDateChange }: EnrollmentCalendarProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const todayDate = today(getLocalTimeZone())
  const maxDate = todayDate.add({ weeks: 2 })

  return (
    <Calendar
      aria-label="Select date"
      value={selectedDate}
      onChange={onDateChange}
      minValue={todayDate.add({ days: 1 })}
      maxValue={maxDate}
      className={`${colorModeContext} w-full`}
    >
      <header className="flex items-center justify-between mb-4">
        <Button
          slot="previous"
          className={`${colorModeContext} p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer background-text`}
        >
          <FaChevronLeft size={14} />
        </Button>
        <Heading className={`${colorModeContext} text-fluid-base font-semibold background-text`} />
        <Button
          slot="next"
          className={`${colorModeContext} p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer background-text`}
        >
          <FaChevronRight size={14} />
        </Button>
      </header>
      <CalendarGrid className="w-full border-collapse">
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell
              className={`${colorModeContext} text-fluid-xs font-medium text-gray-500 dark:text-gray-400 pb-2`}
            >
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell
              date={date}
              className={({ isSelected, isDisabled, isFocusVisible }) =>
                `${colorModeContext} w-10 h-10 text-fluid-sm rounded-lg flex items-center justify-center cursor-pointer transition-colors outline-none
                ${isSelected
                  ? 'bg-first-color text-white font-semibold'
                  : isDisabled
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'background-text hover:bg-gray-200 dark:hover:bg-gray-700'
                }
                ${isFocusVisible ? 'ring-2 ring-first-color ring-offset-2' : ''}
              `}
            />
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </Calendar>
  )
}

export { EnrollmentCalendar }
export type { EnrollmentCalendarProps }
