import type { BasketballHoop, BasketballHoopWithEnrollments } from '../types/types'
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

export { fetchHoops, insertHoop, signUp, signIn }