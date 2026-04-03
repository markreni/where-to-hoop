import type { BasketballHoop, ObservationImage, PlayerEnrollment, PublicProfile, FollowRequest, ProfileImage } from '../types/types'
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
    isPaid: hoop.is_paid,
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
    is_paid: hoop.isPaid,
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
    isPaid: data.is_paid,
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
  fields: { name: string; description: string; condition: string; isIndoor: boolean; isPaid: boolean; coordinates: { latitude: number | null; longitude: number | null }; address?: string | null },
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
      is_paid: fields.isPaid,
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
    isPaid: data.is_paid,
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
    isPaid: data.is_paid,
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

const getProfileImageUrl = (imagePath: string): string => {
  const { data } = supabase.storage.from('profile-images').getPublicUrl(imagePath)
  return data.publicUrl
}

const uploadProfileImage = async (userId: string, file: File, oldImage: ProfileImage | null): Promise<ProfileImage> => {
  const timestamp = Date.now()
  const oldImagePath: string | undefined = oldImage?.imagePath
  const path = `${userId}/profile-${timestamp}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(path, file)

  if (uploadError) {
    console.error('Profile image upload error:', uploadError.message)
    throw uploadError
  }

  const profileImage: ProfileImage = {
    imagePath: path,
    uploadedAt: new Date(timestamp).toISOString(),
  }

  const { error: dbError } = await supabase
    .from('users')
    .update({ profile_image: profileImage })
    .eq('id', userId)

  if (dbError) {
    await supabase.storage.from('profile-images').remove([path])
    console.error('Update profile image in DB error:', dbError.message)
    throw dbError
  }

  const { error: authError } = await supabase.auth.updateUser({ data: { profile_image: profileImage } })

  if (authError) {
    // Roll back: remove from storage and revert DB to previous state
    await supabase.storage.from('profile-images').remove([path])
    if (oldImagePath) {
      const oldProfileImage: ProfileImage = { imagePath: oldImagePath, uploadedAt: oldImage?.uploadedAt ?? new
  Date().toISOString() }
      await supabase.from('users').update({ profile_image: oldProfileImage }).eq('id', userId)
    } else {
      await supabase.from('users').update({ profile_image: null }).eq('id', userId)
    }
    console.error('Update auth metadata profile image error:', authError.message)
    throw authError
  }

  // Clean up old image after successful update
  if (oldImagePath) {
    const { error: removeError } = await supabase.storage.from('profile-images').remove([oldImagePath])
    if (removeError) {
      console.error('Remove old profile image error:', removeError.message)
    }
  }

  return profileImage
}

const removeProfileImage = async (userId: string, image: ProfileImage | null): Promise<void> => {
  const imagePath: string | undefined = image?.imagePath
  // Update DB and auth first, then delete from storage last.
  // If DB/auth fails, the file stays in storage and state remains consistent.
  const { error: dbError } = await supabase
    .from('users')
    .update({ profile_image: null })
    .eq('id', userId)

  if (dbError) {
    console.error('Remove profile image from DB error:', dbError.message)
    throw dbError
  }

  const { error: authError } = await supabase.auth.updateUser({ data: { profile_image: null } })

  if (authError) {
    // Roll back DB to keep state consistent
    await supabase.from('users').update({ profile_image: { imagePath, uploadedAt: image?.uploadedAt ?? new
  Date().toISOString() } }).eq('id', userId)
    console.error('Remove profile image from auth error:', authError.message)
    throw authError
  }

  if (imagePath) {
    const { error: storageError } = await supabase.storage.from('profile-images').remove([imagePath])
    if (storageError) {
      console.error('Remove profile image from storage error:', storageError.message)
    }
  }
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
    .select('id, nickname, public, profile_image')
    .eq('public', true)
    .order('nickname', { ascending: true })

  if (error) {
    console.error('Fetch all players error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nickname: row.nickname, public: row.public, profileImage: row.profile_image ?? null }))
}

const searchAllPlayersByNickname = async (query: string): Promise<PublicProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public, profile_image')
    .ilike('nickname', `%${query}%`)
    .order('nickname', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Search all players error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nickname: row.nickname, public: row.public, profileImage: row.profile_image ?? null }))
}

const fetchPlayerByNickname = async (nickname: string): Promise<PublicProfile> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, public, profile_image')
    .ilike('nickname', nickname)
    .single()

  if (error) {
    console.error('Fetch player by nickname error:', error.message)
    throw error
  }

  return { id: data.id, nickname: data.nickname, public: data.public, profileImage: data.profile_image ?? null }
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
    .select('id, nickname, public, profile_image')
    .in('id', userIds)

  if (error) {
    console.error('Fetch public profiles error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nickname: row.nickname, public: row.public, profileImage: row.profile_image ?? null }))
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

const fetchExpiredEnrollmentCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('player_enrollment')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', userId)
    .eq('expired', true)

  if (error) {
    console.error('Fetch expired enrollment count error:', error.message)
    throw error
  }

  return count ?? 0
}

const fetchActiveEnrollments = async (userId: string): Promise<PlayerEnrollment[]> => {
  const { data, error } = await supabase
    .from('player_enrollment')
    .select('*')
    .eq('player_id', userId)
    .eq('expired', false)
    .order('arrival_time', { ascending: true })

  if (error) {
    console.error('Fetch active enrollments error:', error.message)
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

const fetchUserProfileImage = async (userId: string): Promise<ProfileImage | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('profile_image')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Fetch user profile image error:', error.message)
    throw error
  }

  return data?.profile_image ?? null
}

interface UserWithProfileImage {
  id: string
  nickname: string
  profileImage: ProfileImage
}

const fetchUsersWithProfileImages = async (): Promise<UserWithProfileImage[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, profile_image')
    .not('profile_image', 'is', null)
    .order('nickname', { ascending: true })

  if (error) {
    console.error('Fetch users with profile images error:', error.message)
    throw error
  }

  return (data ?? []).map(row => ({
    id: row.id,
    nickname: row.nickname,
    profileImage: row.profile_image,
  }))
}

// Note: this clears profile_image from the DB and storage but NOT from the target user's auth metadata,
// because supabase.auth.updateUser() can only update the currently logged-in user.
// This is fine — no code reads profile images from auth metadata. The stale reference gets overwritten on the user's next upload.
const adminRemoveProfileImage = async (userId: string, imagePath: string): Promise<void> => {
  const { data, error: dbError } = await supabase
    .from('users')
    .update({ profile_image: null })
    .eq('id', userId)
    .select('id')

  if (dbError) {
    console.error('Admin remove profile image from DB error:', dbError.message)
    throw dbError
  }

  if (!data || data.length === 0) {
    throw new Error('Profile image update failed — no rows affected. Check RLS policies.')
  }

  const { error: storageError } = await supabase.storage.from('profile-images').remove([imagePath])
  if (storageError) {
    console.error('Admin remove profile image from storage error:', storageError.message)
  }
}

export { fetchHoops, insertHoop, updateHoop, deleteHoop, fetchAllEnrollments, fetchUserEnrollments, fetchHoopEnrollments, insertEnrollment, deleteEnrollment, updateProfileVisibility, signUp, signIn, getHoopImageUrl, getProfileImageUrl, uploadProfileImage, removeProfileImage, fetchFavorites, toggleFavoriteRequest, fetchFollowers, fetchFollowing, fetchPublicProfiles, toggleFollowRequest, fetchAllPlayers, searchAllPlayersByNickname, fetchPlayerByNickname, sendFollowRequest, cancelFollowRequest, removeFollower, fetchIncomingFollowRequests, fetchOutgoingFollowRequestIds, acceptFollowRequest, rejectFollowRequest, fetchExpiredEnrollmentCount, fetchActiveEnrollments, fetchUserProfileImage, fetchUsersWithProfileImages, adminRemoveProfileImage }

export type { UserWithProfileImage }