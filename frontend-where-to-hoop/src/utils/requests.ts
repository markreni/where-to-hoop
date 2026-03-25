import type { BasketballHoop, ObservationImage, PlayerEnrollment } from '../types/types'
import supabase from './supabase'

const fetchHoops = async (): Promise<BasketballHoop[]> => {
  const { data, error } = await supabase
    .from('basketball_hoop')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Fetch error:', error.message)
    throw error
  }

  return (data ?? []).map(hoop => ({
    id: hoop.id,
    name: hoop.name,
    description: hoop.description,
    condition: hoop.condition,
    isIndoor: hoop.is_indoor,
    createdAt: hoop.created_at,
    addedBy: hoop.added_by,
    address: hoop.address ?? undefined,
    images: hoop.images ?? [],
    coordinates: {
      latitude: hoop.latitude,
      longitude: hoop.longitude
    }
  }))
}

const insertHoop = async (hoop: Omit<BasketballHoop, 'id'>, imageFiles: File[], userId: string) => {
  const uploadedPaths: string[] = []
  const uploadedAt = Date.now()

  const observationImages: ObservationImage[] = await Promise.all(
    imageFiles.map(async (file, index) => {
      const path = `${userId}/${uploadedAt}-${index}-${file.name}`
      const { error } = await supabase.storage
        .from('hoop-images')
        .upload(path, file)
      if (error) {
        // Clean up any files already uploaded before throwing
        if (uploadedPaths.length > 0) {
          await supabase.storage.from('hoop-images').remove(uploadedPaths)
        }
        throw error
      }
      uploadedPaths.push(path)
      return {
        id: uploadedAt + index,
        imagePath: path,
        addedDate: new Date(uploadedAt).toISOString(),
      }
    })
  )

  const insertPayload = {
    name: hoop.name,
    description: hoop.description,
    condition: hoop.condition,
    is_indoor: hoop.isIndoor,
    latitude: hoop.coordinates.latitude,
    longitude: hoop.coordinates.longitude,
    address: hoop.address ?? null,
    images: observationImages,
    added_by: hoop.addedBy
  }

  const { data, error } = await supabase
    .from('basketball_hoop')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    // Clean up all uploaded files if DB insert fails
    await supabase.storage.from('hoop-images').remove(uploadedPaths)
    console.error('Insert error:', error)
    throw error
  }
  console.log('Inserted hoop:', data)
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    condition: data.condition,
    isIndoor: data.is_indoor,
    createdAt: data.created_at,
    addedBy: data.added_by,
    address: data.address ?? undefined,
    images: data.images ?? [],
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

const deleteHoop = async (id: string): Promise<BasketballHoop> => {
  const { data, error } = await supabase.from('basketball_hoop').delete().eq('id', id).select().single()

  if (error) {
    console.error('Delete error:', error)
    throw error
  }

  const imagePaths: string[] = (data.images ?? []).map((img: ObservationImage) => img.imagePath)
  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('hoop-images').remove(imagePaths)
    if (storageError) {
      console.error('Storage cleanup error:', storageError)
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    condition: data.condition,
    isIndoor: data.is_indoor,
    createdAt: data.created_at,
    addedBy: data.added_by,
    address: data.address ?? undefined,
    images: data.images ?? [],
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude
    }
  }
}

const fetchUserEnrollments = async (userId: string): Promise<PlayerEnrollment[]> => {
  const { data, error } = await supabase
    .from('player_enrollment')
    .select('*')
    .eq('player_id', userId)
    .order('arrival_time', { ascending: false })

  if (error) {
    console.error('Fetch user enrollments error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({
    id: row.id,
    playerId: row.player_id,
    playerNickname: row.player_nickname,
    hoopId: row.hoop_id,
    arrivalTime: new Date(row.arrival_time),
    duration: row.duration,
    expired: row.expired,
    playMode: row.play_mode,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
  }))
}

const fetchAllEnrollments = async (): Promise<PlayerEnrollment[]> => {
  // Only fetch enrollments from the last 12 hours onward (max session duration is 12h)
  const cutoff = new Date(Date.now() - 720 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('player_enrollment')
    .select('*')
    .gte('arrival_time', cutoff)

  if (error) {
    console.error('Fetch all enrollments error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({
    id: row.id,
    playerId: row.player_id,
    playerNickname: row.player_nickname,
    hoopId: row.hoop_id,
    arrivalTime: new Date(row.arrival_time),
    duration: row.duration,
    expired: row.expired,
    playMode: row.play_mode,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
  }))
}

const fetchHoopEnrollments = async (hoopId: string): Promise<PlayerEnrollment[]> => {
  const { data, error } = await supabase
    .from('player_enrollment')
    .select('*')
    .eq('hoop_id', hoopId)

  if (error) {
    console.error('Fetch enrollments error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({
    id: row.id,
    playerId: row.player_id,
    playerNickname: row.player_nickname,
    hoopId: row.hoop_id,
    arrivalTime: new Date(row.arrival_time),
    duration: row.duration,
    expired: row.expired,
    playMode: row.play_mode,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
  }))
}

const insertEnrollment = async (enrollment: Omit<PlayerEnrollment, 'id' | 'createdAt' | 'playerEmail' | 'hoopName'>): Promise<PlayerEnrollment> => {
  const insertPayload = {
    player_id: enrollment.playerId,
    player_nickname: enrollment.playerNickname,
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
    playerNickname: data.player_nickname,
    hoopId: data.hoop_id,
    arrivalTime: new Date(data.arrival_time),
    duration: data.duration,
    expired: data.expired,
    playMode: data.play_mode,
    note: data.note ?? undefined,
    createdAt: new Date(data.created_at),
  }
}

const deleteEnrollment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('player_enrollment')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete enrollment error:', error)
    throw error
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

const getHoopImageUrl = (imagePath: string): string => {
  const { data } = supabase.storage.from('hoop-images').getPublicUrl(imagePath)
  return data.publicUrl
}

const fetchFavorites = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('favourite_hoops')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Fetch favorites error:', error.message)
    throw error
  }

  return (data?.favourite_hoops ?? []) as string[]
}

const toggleFavoriteRequest = async (userId: string, hoopId: string, add: boolean): Promise<void> => {
  const current = await fetchFavorites(userId)
  const updated = add
    ? [...new Set([...current, hoopId])]
    : current.filter((id: string) => id !== hoopId)

  const { error } = await supabase
    .from('users')
    .update({ favourite_hoops: updated })
    .eq('id', userId)

  if (error) {
    console.error('Toggle favorite error:', error.message)
    throw error
  }
}

export { fetchHoops, insertHoop, deleteHoop, fetchAllEnrollments, fetchUserEnrollments, fetchHoopEnrollments, insertEnrollment, deleteEnrollment, signUp, signIn, getHoopImageUrl, fetchFavorites, toggleFavoriteRequest }