import { TIME_SLOTS } from "../components/reusable/TimeSlotPicker";
import type { TimeSlot, PlayerEnrollment } from "../types/types";

const haversineDistance = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], isMiles = false) => {
      const toRadian = (angle: number) => (Math.PI / 180) * angle;
      const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
      const RADIUS_OF_EARTH_IN_KM = 6371;

      const dLat = distance(lat2, lat1);
      const dLon = distance(lon2, lon1);

      lat1 = toRadian(lat1);
      lat2 = toRadian(lat2);

      // Haversine Formula
      const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.asin(Math.sqrt(a));

      let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

      if (isMiles) {
        finalDistance /= 1.60934;
      }

      return finalDistance;
    };

    // Helper to get the start hour for a time slot
export const getTimeSlotStartHour = (slot: TimeSlot): number => {
  const slotConfig = TIME_SLOTS.find(s => s.id === slot)
  return slotConfig?.startHour ?? 12
}



// Group enrollments by time status
export const groupEnrollmentsByTime = (enrollments: PlayerEnrollment[]): {
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

export default haversineDistance;