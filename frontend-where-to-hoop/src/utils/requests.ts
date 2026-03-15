import type { BasketballHoop, BasketballHoopWithEnrollments } from '../types/types'
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

const insertHoop = async (hoop: Omit<BasketballHoop, 'id'>) => {
  const insertPayload = {
    name: hoop.name,
    description: hoop.description,
    condition: hoop.condition,
    is_indoor: hoop.isIndoor,
    latitude: hoop.coordinates.latitude,
    longitude: hoop.coordinates.longitude,
    address: hoop.address ?? null,
    images: hoop.images?.[0] ?? null,
  }
  const { data, error } = await supabase.from('basketball_hoop').insert(insertPayload).select().single()
  if (error) {
    console.error('Insert error:', error)
    throw error
  }
  console.log('Inserted hoop:', data)
  return {
    ...data,
    playerEnrollments: [],
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude
    }
  }
}

export { fetchHoops, insertHoop } 