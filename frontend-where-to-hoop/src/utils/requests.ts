import type { BasketballHoop, ObservationImage, PlayerEnrollment, PublicProfile, FollowRequest } from '../types/types'
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

  // NOT NEEDED when cron job is implemented
  // const cutoff = new Date(Date.now() - 720 * 60 * 1000).toISOString().  add below -> .gte('arrival_time', cutoff)

  const { data, error } = await supabase
    .from('player_enrollment')
    .select('*')
    .eq('expired', false)

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
    .eq('expired', false)

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

const searchAllPlayersByNickname = async (query: string): Promise<PublicProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public')
    .ilike('nickname', `%${query}%`)
    .order('nickname', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Search all players error:', error.message)
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

const removeFollower = async (userId: string, targetId: string): Promise<void> => {
  // database has trigger to delete follow request when a follower is removed, so we only need to delete from followers table here
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetId)

  if (error) {
    console.error('Delete follow error:', error.message)
    throw error
  }
}

const fetchFollowers = async (userId: string): Promise<PublicProfile[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('following_id', userId)

  if (error) {
    console.error('Fetch followers error:', error.message)
    throw error
  }

  if (!data || data.length === 0) return []

  return fetchPublicProfiles(data.map(row => row.follower_id))
}

const fetchFollowing = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  if (error) {
    console.error('Fetch following error:', error.message)
    throw error
  }

  return (data ?? []).map(row => row.following_id)
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

const sendFollowRequest = async (fromId: string, toId: string): Promise<void> => {
  const { error } = await supabase
    .from('follow_requests')
    .insert({ from_user_id: fromId, to_user_id: toId })

  if (error) {
    console.error('Send follow request error:', error.message)
    throw error
  }
}

const cancelFollowRequest = async (fromId: string, toId: string): Promise<void> => {
  const { error } = await supabase
    .from('follow_requests')
    .delete()
    .eq('from_user_id', fromId)
    .eq('to_user_id', toId)
    .eq('status', 'pending')

  if (error) {
    console.error('Cancel follow request error:', error.message)
    throw error
  }
}

const fetchIncomingFollowRequests = async (userId: string): Promise<FollowRequest[]> => {
  const { data, error } = await supabase
    .from('follow_requests')
    .select('id, from_user_id, to_user_id, status, created_at')
    .eq('to_user_id', userId)
    .eq('status', 'pending')

  if (error) {
    console.error('Fetch incoming follow requests error:', error.message)
    throw error
  }

  if (!data || data.length === 0) return []

  const profiles = await fetchPublicProfiles(data.map(r => r.from_user_id))
  const nicknameMap = Object.fromEntries(profiles.map(p => [p.id, p.nickname]))

  return data.map(row => ({
    id: row.id,
    fromUserId: row.from_user_id,
    fromUserNickname: nicknameMap[row.from_user_id] ?? 'Unknown',
    toUserId: row.to_user_id,
    status: row.status,
    createdAt: new Date(row.created_at),
  }))
}

const fetchOutgoingFollowRequestIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('follow_requests')
    .select('to_user_id')
    .eq('from_user_id', userId)
    .eq('status', 'pending')

  if (error) {
    console.error('Fetch outgoing follow requests error:', error.message)
    throw error
  }

  return (data ?? []).map(row => row.to_user_id)
}

const acceptFollowRequest = async (requestId: string): Promise<void> => {
  // database has trigger to insert into followers table when follow request status is updated to accepted, so we only need to update the request status here
  const { error } = await supabase
    .from('follow_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  if (error) {
    console.error('Accept follow request error:', error.message)
    throw error
  }
}

const rejectFollowRequest = async (requestId: string): Promise<void> => {
  const { error } = await supabase
    .from('follow_requests')
    .delete()
    .eq('id', requestId)

  if (error) {
    console.error('Reject follow request error:', error.message)
    throw error
  }
}

const toggleFollowRequest = async (userId: string, targetId: string, add: boolean, targetIsPublic: boolean): Promise<void> => {
  if (add) {
    if (targetIsPublic) {
      const { error } = await supabase
        .from('followers')
        .insert({ follower_id: userId, following_id: targetId })
      if (error) {
        console.error('Insert follow error:', error.message)
        throw error
      }
    } else {
      await sendFollowRequest(userId, targetId)
    }
  } else {
    const { data } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', targetId)
      .maybeSingle()

    if (data) {
      await removeFollower(userId, targetId)
    } else {
      await cancelFollowRequest(userId, targetId)
    }
  }
}

export { fetchHoops, insertHoop, updateHoop, deleteHoop, fetchAllEnrollments, fetchUserEnrollments, fetchHoopEnrollments, insertEnrollment, deleteEnrollment, updateProfileVisibility, signUp, signIn, getHoopImageUrl, fetchFavorites, toggleFavoriteRequest, fetchFollowers, fetchFollowing, fetchPublicProfiles, toggleFollowRequest, fetchAllPlayers, searchAllPlayersByNickname, fetchPlayerByNickname, sendFollowRequest, cancelFollowRequest, removeFollower, fetchIncomingFollowRequests, fetchOutgoingFollowRequestIds, acceptFollowRequest, rejectFollowRequest }