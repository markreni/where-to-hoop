import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from 'react-aria-components'
import { TIME_SLOTS } from '../components/reusable/TimeSlotPicker'
import type { TimeSlot } from '../types/types'

export type WhenMode = 'today' | 'later'

const getMaxArrivalMinutes = (): number => {
  const now = new Date()
  const minutesUntilMidnight = (23 - now.getHours()) * 60 + (60 - now.getMinutes())
  return Math.min(Math.floor(minutesUntilMidnight / 30) * 30, 1440) // Max 24 hours (1440 minutes), rounded down to nearest 30
}

const getTimeSlotStartHour = (slot: TimeSlot): number => {
  const slotConfig = TIME_SLOTS.find(s => s.id === slot)
  return slotConfig?.startHour ?? 12
}

const isTodayDate = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getSessionEndTime = (arrival: Date, durationMinutes: number): Date =>
  new Date(arrival.getTime() + durationMinutes * 60_000)

const isWithinWindow = (
  target: Date,
  startOffsetMs: number,
  endOffsetMs: number,
): boolean => {
  const targetMs = target.getTime()
  const nowMs = new Date().getTime()
  return nowMs >= targetMs - startOffsetMs && nowMs <= targetMs + endOffsetMs
}

const calculateArrivalTime = (
  whenMode: WhenMode,
  arrivalMinutes: number,
  selectedDate: DateValue | null,
  selectedTimeSlot: TimeSlot | null,
): Date => {
  const now = new Date()

  if (whenMode === 'today') {
    return new Date(now.getTime() + arrivalMinutes * 60 * 1000)
  }

  if (!selectedDate || !selectedTimeSlot) {
    return now
  }

  const arrivalDate: Date = selectedDate.toDate(getLocalTimeZone())
  const startHour: number = getTimeSlotStartHour(selectedTimeSlot)
  arrivalDate.setHours(startHour, 0, 0, 0)
  return arrivalDate
}

export { getMaxArrivalMinutes, getTimeSlotStartHour, isTodayDate, getSessionEndTime, isWithinWindow, calculateArrivalTime }