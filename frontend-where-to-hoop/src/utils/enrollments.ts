import type { PlayerEnrollment } from '../types/types'
import { isTodayDate } from './time'

const hasEnrollmentInSameDayBucket = (
  candidates: PlayerEnrollment[],
  userId: string,
  target: PlayerEnrollment,
): boolean => {
  const targetIsToday: boolean = isTodayDate(new Date(target.arrivalTime))
  return candidates.some(e =>
    e.hoopId === target.hoopId &&
    e.id !== target.id &&
    e.playerId === userId &&
    isTodayDate(new Date(e.arrivalTime)) === targetIsToday
  )
}

const groupEnrollmentsByTime = (enrollments: PlayerEnrollment[] = []): {
  playingNow: PlayerEnrollment[]
  comingSoon: PlayerEnrollment[] // Coming later today
  comingLater: PlayerEnrollment[] // Coming on a future day
} => {
  const now = new Date()

  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const playingNow: PlayerEnrollment[] = []
  const comingSoon: PlayerEnrollment[] = []
  const comingLater: PlayerEnrollment[] = []

  enrollments.forEach(enrollment => {
    const arrivalTime = new Date(enrollment.arrivalTime)
    //const endTime = new Date(arrivalTime.getTime() + enrollment.duration * 60 * 1000)

    if (arrivalTime <= now) {
      playingNow.push(enrollment)
    } else if (arrivalTime > now && arrivalTime <= endOfToday) {
      comingSoon.push(enrollment)
    } else if (arrivalTime > endOfToday) {
      comingLater.push(enrollment)
    }
  })

  playingNow.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
  comingSoon.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
  comingLater.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())

  return { playingNow, comingSoon, comingLater }
}

const groupEnrollmentsByHoop = (enrollments: PlayerEnrollment[]): Map<string, PlayerEnrollment[]> => {
  const map = new Map<string, PlayerEnrollment[]>()
  for (const enrollment of enrollments) {
    if (!enrollment.hoopId) continue
    const existing = map.get(enrollment.hoopId) ?? []
    map.set(enrollment.hoopId, [...existing, enrollment])
  }
  return map
}

export { hasEnrollmentInSameDayBucket, groupEnrollmentsByTime, groupEnrollmentsByHoop }
