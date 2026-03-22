import type { BasketballHoop, BasketballHoopWithEnrollments, PlayerEnrollment } from '../types/types'
import supabase from './supabase'

const fetchHoops = async (): Promise<BasketballHoopWithEnrollments[]> => {
  const { data, error } = await supabase
    .from('basketball_hoop')
    .select("*")
    .order('created_at', { ascending: true})

  if (error) { 
    console.error('Fetch error:', error.message)
    throw error
  }

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
    added_by: hoop.addedBy
  }

  const { data, error } = await supabase
    .from('basketball_hoop')
    .insert(insertPayload)
    .select()
    .single()

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
/*
const updateHoop = async (id: string, newDescription: string): Promise<BasketballHoop> => {
  
  const { data, error } = await supabase.from('basketball_hoop').update({ description: newDescription }).eq('id', id).select().single()
  
  if (error) {
    console.error('Update error:', error)
    throw error
  }
  console.log('Updated hoop:', data)

  return {
    ...data,
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude
    }
  } 
}
*/

/*
const deleteHoop = async (id: string): Promise<BasketballHoop> => {
  
  const { data, error } = await supabase.from('basketball_hoop').delete().eq('id', id).select().single()
  
  if (error) {
    console.error('Delete error:', error)
    throw error
  }
  console.log('Deleted hoop:', data)

  return {
    ...data,
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude
    }
  } 
}
*/

const insertEnrollment = async (enrollment: Omit<PlayerEnrollment, 'id' | 'createdAt' | 'playerEmail' | 'hoopName'>): Promise<PlayerEnrollment> => {
  const insertPayload = {
    player_id: enrollment.playerId,
    hoop_id: enrollment.hoopId,
    arrival_time: enrollment.arrivalTime,
    duration: enrollment.duration,
    play_mode: enrollment.playMode,
    note: enrollment.note ?? null,
  }

  const { data, error } = await supabase
    .from('player_enrollment')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('Insert enrollment error:', error)
    throw error
  }

  return {
    id: data.id,
    playerId: data.player_id,
    hoopId: data.hoop_id,
    arrivalTime: new Date(data.arrival_time),
    duration: data.duration,
    playMode: data.play_mode,
    note: data.note ?? undefined,
    createdAt: new Date(data.created_at),
  }
}

const signUp = async (email: string, password: string, nickname: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })
  if (error) {
    console.error('Sign up error:', error.message)
    throw error
  }
  return data
}

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Sign in error:', error.message)
    throw error
  }
  return data
}

export { fetchHoops, insertHoop, insertEnrollment, signUp, signIn }