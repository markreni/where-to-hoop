import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseMockInstance } from './supabaseMock'

vi.mock('../../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

import {
  fetchFavorites,
  toggleFavoriteRequest,
  fetchAllPlayers,
  searchAllPlayersByNickname,
  fetchPlayerByNickname,
  fetchUserBio,
  updateUserBio,
  updateProfileVisibility,
  fetchUserProfileImage,
  fetchUsersWithProfileImages,
} from '../../services/requests'

const { queueTable, getBuilder, supabase } = supabaseMockInstance

const playerRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'u-1',
  nickname: 'Nick',
  public: true,
  profile_image: null,
  bio: null,
  ...overrides,
})

beforeEach(() => {
  supabaseMockInstance.reset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('fetchFavorites', () => {
  it('returns the favourite_hoops array', async () => {
    queueTable('users', {
      data: { favourite_hoops: ['h-1', 'h-2'] },
      error: null,
    })
    expect(await fetchFavorites('u-1')).toEqual(['h-1', 'h-2'])
  })

  it('returns [] when favourite_hoops is missing', async () => {
    queueTable('users', { data: { favourite_hoops: null }, error: null })
    expect(await fetchFavorites('u-1')).toEqual([])
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchFavorites('u-1')).rejects.toBeDefined()
  })
})

describe('toggleFavoriteRequest', () => {
  it('adds a hoop when not present', async () => {
    // First call: fetchFavorites
    queueTable('users', { data: { favourite_hoops: ['h-1'] }, error: null })
    // Second call: update
    queueTable('users', { data: null, error: null })

    await toggleFavoriteRequest('u-1', 'h-2', true)

    // Second users builder — the update
    expect(getBuilder('users', 1).update).toHaveBeenCalledWith({
      favourite_hoops: ['h-1', 'h-2'],
    })
  })

  it('removes a hoop when add=false', async () => {
    queueTable('users', {
      data: { favourite_hoops: ['h-1', 'h-2'] },
      error: null,
    })
    queueTable('users', { data: null, error: null })

    await toggleFavoriteRequest('u-1', 'h-1', false)

    expect(getBuilder('users', 1).update).toHaveBeenCalledWith({
      favourite_hoops: ['h-2'],
    })
  })

  it('deduplicates when adding an already-present hoop', async () => {
    queueTable('users', { data: { favourite_hoops: ['h-1'] }, error: null })
    queueTable('users', { data: null, error: null })

    await toggleFavoriteRequest('u-1', 'h-1', true)

    expect(getBuilder('users', 1).update).toHaveBeenCalledWith({
      favourite_hoops: ['h-1'],
    })
  })

  it('throws when update fails', async () => {
    queueTable('users', { data: { favourite_hoops: [] }, error: null })
    queueTable('users', { data: null, error: { message: 'bad' } })

    await expect(
      toggleFavoriteRequest('u-1', 'h-1', true),
    ).rejects.toBeDefined()
  })
})

describe('fetchAllPlayers', () => {
  it('maps rows to PublicProfile', async () => {
    queueTable('users', {
      data: [playerRow({ bio: 'hi', profile_image: { imagePath: 'x.jpg', uploadedAt: 't' } })],
      error: null,
    })
    const result = await fetchAllPlayers()
    expect(result[0].bio).toBe('hi')
    expect(result[0].profileImage).toEqual({ imagePath: 'x.jpg', uploadedAt: 't' })
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchAllPlayers()).rejects.toBeDefined()
  })
})

describe('searchAllPlayersByNickname', () => {
  it('returns mapped results', async () => {
    queueTable('users', { data: [playerRow()], error: null })
    const result = await searchAllPlayersByNickname('nick')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('u-1')
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(searchAllPlayersByNickname('nick')).rejects.toBeDefined()
  })
})

describe('fetchPlayerByNickname', () => {
  it('returns a single mapped profile', async () => {
    queueTable('users', { data: playerRow(), error: null })
    const result = await fetchPlayerByNickname('Nick')
    expect(result.id).toBe('u-1')
    expect(result.profileImage).toBeNull()
    expect(result.bio).toBeNull()
  })

  it('throws when not found', async () => {
    queueTable('users', { data: null, error: { message: 'not found' } })
    await expect(fetchPlayerByNickname('x')).rejects.toBeDefined()
  })
})

describe('fetchUserBio', () => {
  it('returns the bio', async () => {
    queueTable('users', { data: { bio: 'About me' }, error: null })
    expect(await fetchUserBio('u-1')).toBe('About me')
  })

  it('returns null when bio is missing', async () => {
    queueTable('users', { data: { bio: null }, error: null })
    expect(await fetchUserBio('u-1')).toBeNull()
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchUserBio('u-1')).rejects.toBeDefined()
  })
})

describe('updateUserBio', () => {
  it('trims the bio before updating', async () => {
    queueTable('users', { data: null, error: null })
    await updateUserBio('u-1', '  hello  ')
    expect(getBuilder('users').update).toHaveBeenCalledWith({ bio: 'hello' })
  })

  it('sets bio to null when given an empty/whitespace string', async () => {
    queueTable('users', { data: null, error: null })
    await updateUserBio('u-1', '   ')
    expect(getBuilder('users').update).toHaveBeenCalledWith({ bio: null })
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(updateUserBio('u-1', 'x')).rejects.toBeDefined()
  })
})

describe('updateProfileVisibility', () => {
  it('updates the DB row then the auth metadata', async () => {
    queueTable('users', { data: null, error: null })

    await updateProfileVisibility('u-1', true)

    expect(getBuilder('users').update).toHaveBeenCalledWith({ public: true })
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { public: true },
    })
  })

  it('throws when DB update fails and skips auth', async () => {
    queueTable('users', { data: null, error: { message: 'db bad' } })
    await expect(
      updateProfileVisibility('u-1', true),
    ).rejects.toBeDefined()
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('throws when auth update fails', async () => {
    queueTable('users', { data: null, error: null })
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: {},
      error: { message: 'auth bad' },
    })
    await expect(
      updateProfileVisibility('u-1', false),
    ).rejects.toBeDefined()
  })
})

describe('fetchUserProfileImage', () => {
  it('returns the profile_image object', async () => {
    queueTable('users', {
      data: { profile_image: { imagePath: 'x.jpg', uploadedAt: 't' } },
      error: null,
    })
    expect(await fetchUserProfileImage('u-1')).toEqual({
      imagePath: 'x.jpg',
      uploadedAt: 't',
    })
  })

  it('returns null when missing', async () => {
    queueTable('users', { data: { profile_image: null }, error: null })
    expect(await fetchUserProfileImage('u-1')).toBeNull()
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchUserProfileImage('u-1')).rejects.toBeDefined()
  })
})

describe('fetchUsersWithProfileImages', () => {
  it('maps rows to UserWithProfileImage', async () => {
    queueTable('users', {
      data: [
        {
          id: 'u-1',
          nickname: 'Nick',
          profile_image: { imagePath: 'x.jpg', uploadedAt: 't' },
        },
      ],
      error: null,
    })
    const result = await fetchUsersWithProfileImages()
    expect(result).toEqual([
      {
        id: 'u-1',
        nickname: 'Nick',
        profileImage: { imagePath: 'x.jpg', uploadedAt: 't' },
      },
    ])
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchUsersWithProfileImages()).rejects.toBeDefined()
  })
})
