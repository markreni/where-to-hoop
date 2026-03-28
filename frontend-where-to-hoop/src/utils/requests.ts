import type { BasketballHoop, ObservationImage, PlayerEnrollment, PublicProfile } from '../types/types'
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
const updateHoop = async (
  id: string,
  fields: { name: string; description: string; condition: string; isIndoor: boolean; coordinates: { latitude: number | null; longitude: number | null }; address?: string | null },
  newImageFiles: File[],
  removedImagePaths: string[],
  keptImages: ObservationImage[],
  userId: string,
  profileIsNewImage: boolean = false
): Promise<BasketballHoop> => {
  const uploadedPaths: string[] = []
  const uploadedAt = Date.now()

  // Upload new images
  const newObservationImages: ObservationImage[] = await Promise.all(
    newImageFiles.map(async (file, index) => {
      const path = `${userId}/${uploadedAt}-${index}-${file.name}`
      const { error } = await supabase.storage.from('hoop-images').upload(path, file)
      if (error) {
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

  // Delete removed images from storage
  if (removedImagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('hoop-images').remove(removedImagePaths)
    if (storageError) {
      console.error('Storage remove error:', storageError)
    }
  }

  const updatedImages = profileIsNewImage
    ? [...newObservationImages, ...keptImages]
    : [...keptImages, ...newObservationImages]

  const { data, error } = await supabase
    .from('basketball_hoop')
    .update({
      name: fields.name,
      description: fields.description,
      condition: fields.condition,
      is_indoor: fields.isIndoor,
      latitude: fields.coordinates.latitude,
      longitude: fields.coordinates.longitude,
      address: fields.address ?? null,
      images: updatedImages,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('hoop-images').remove(uploadedPaths)
    }
    console.error('Update error:', error)
    throw error
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
      longitude: data.longitude,
    },
  }
}

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
    expired: enrollment.expired,
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

const updateProfileVisibility = async (userId: string, isPublic: boolean): Promise<void> => {
  const { error: dbError } = await supabase
    .from('users')
    .update({ public: isPublic })
    .eq('id', userId)

  if (dbError) {
    console.error('Update profile visibility error:', dbError.message)
    throw dbError
  }

  const { error: authError } = await supabase.auth.updateUser({ data: { public: isPublic } })

  if (authError) {
    console.error('Update auth metadata error:', authError.message)
    throw authError
  }
}

const signUp = async (email: string, password: string, nickname: string, isPublic: boolean) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname, public: isPublic } },
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

const fetchAllPlayers = async (): Promise<PublicProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public')
    .eq('public', true)
    .order('nickname', { ascending: true })

  if (error) {
    console.error('Fetch all players error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nickname: row.nickname, public: row.public }))
}

const fetchPlayerByNickname = async (nickname: string): Promise<PublicProfile> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public')
    .ilike('nickname', nickname)
    .single()

  if (error) {
    console.error('Fetch player by nickname error:', error.message)
    throw error
  }

  return { id: data.id, nickname: data.nickname, public: data.public }
}

const fetchFollowing = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('following')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Fetch following error:', error.message)
    throw error
  }

  return (data?.following ?? []) as string[]
}

const fetchPublicProfiles = async (userIds: string[]): Promise<PublicProfile[]> => {
  if (userIds.length === 0) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public')
    .in('id', userIds)

  if (error) {
    console.error('Fetch public profiles error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nickname: row.nickname, public: row.public }))
}

const toggleFollowRequest = async (userId: string, targetId: string, add: boolean): Promise<void> => {
  const current = await fetchFollowing(userId)
  const updated = add
    ? [...new Set([...current, targetId])]
    : current.filter((id: string) => id !== targetId)

  const { error } = await supabase
    .from('users')
    .update({ following: updated })
    .eq('id', userId)

  if (error) {
    console.error('Toggle follow error:', error.message)
    throw error
  }
}

export { fetchHoops, insertHoop, updateHoop, deleteHoop, fetchAllEnrollments, fetchUserEnrollments, fetchHoopEnrollments, insertEnrollment, deleteEnrollment, updateProfileVisibility, signUp, signIn, getHoopImageUrl, fetchFavorites, toggleFavoriteRequest, fetchFollowing, fetchPublicProfiles, toggleFollowRequest, fetchAllPlayers, fetchPlayerByNickname }