import type { BasketballHoopWithEnrollments } from '../types/types'
import supabase from './supabase'

const fetchHoops = async (): Promise<BasketballHoopWithEnrollments[]> => {
  const { data, error } = await supabase.from('basketball_hoop').select()
  if (error) throw error
  return (data ?? []).map(hoop => ({
    ...hoop,
    playerEnrollments: [],
    coordinates: {
      latitude: hoop.latitude,
      longitude: hoop.longitude
    }
  }))
}

export { fetchHoops }