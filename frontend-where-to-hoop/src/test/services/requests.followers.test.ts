import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseMockInstance } from './supabaseMock'

vi.mock('../../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

import {
  fetchFollowers,
  fetchFollowing,
  fetchPublicProfiles,
  sendFollowRequest,
  cancelFollowRequest,
  fetchIncomingFollowRequests,
  fetchOutgoingFollowRequestIds,
  acceptFollowRequest,
  rejectFollowRequest,
  removeFollower,
  toggleFollowRequest,
} from '../../services/requests'

const { queueTable, getBuilder, supabase } = supabaseMockInstance

const publicProfileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'u-1',
  nickname: 'Nick',
  public: true,
  profile_image: null,
  bio: null,
  ...overrides,
})

beforeEach(() => {
  supabaseMockInstance.reset()
  supabaseMockInstance.setStrictQueue(true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('fetchPublicProfiles', () => {
  it('short-circuits when given no ids', async () => {
    expect(await fetchPublicProfiles([])).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('maps rows to PublicProfile', async () => {
    queueTable('users', { data: [publicProfileRow()], error: null })
    const result = await fetchPublicProfiles(['u-1'])
    expect(result[0].id).toBe('u-1')
  })

  it('throws on error', async () => {
    queueTable('users', { data: null, error: { message: 'bad' } })
    await expect(fetchPublicProfiles(['u-1'])).rejects.toBeDefined()
  })
})

describe('fetchFollowers', () => {
  it('returns [] when no follower rows', async () => {
    queueTable('followers', { data: [], error: null })
    expect(await fetchFollowers('u-1')).toEqual([])
  })

  it('fetches public profiles for follower IDs', async () => {
    queueTable('followers', {
      data: [{ follower_id: 'a' }, { follower_id: 'b' }],
      error: null,
    })
    queueTable('users', {
      data: [publicProfileRow({ id: 'a', nickname: 'A' }), publicProfileRow({ id: 'b', nickname: 'B' })],
      error: null,
    })
    const result = await fetchFollowers('u-1')
    expect(result.map((r) => r.nickname)).toEqual(['A', 'B'])
  })

  it('throws on error', async () => {
    queueTable('followers', { data: null, error: { message: 'bad' } })
    await expect(fetchFollowers('u-1')).rejects.toBeDefined()
  })
})

describe('fetchFollowing', () => {
  it('returns an array of following_ids', async () => {
    queueTable('followers', {
      data: [{ following_id: 'a' }, { following_id: 'b' }],
      error: null,
    })
    expect(await fetchFollowing('u-1')).toEqual(['a', 'b'])
  })

  it('returns [] when data is null', async () => {
    queueTable('followers', { data: null, error: null })
    expect(await fetchFollowing('u-1')).toEqual([])
  })

  it('throws on error', async () => {
    queueTable('followers', { data: null, error: { message: 'bad' } })
    await expect(fetchFollowing('u-1')).rejects.toBeDefined()
  })
})

describe('sendFollowRequest / cancelFollowRequest', () => {
  it('sendFollowRequest resolves on success', async () => {
    queueTable('follow_requests', { data: null, error: null })
    await expect(sendFollowRequest('a', 'b')).resolves.toBeUndefined()
  })

  it('sendFollowRequest throws on error', async () => {
    queueTable('follow_requests', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(sendFollowRequest('a', 'b')).rejects.toBeDefined()
  })

  it('cancelFollowRequest resolves on success', async () => {
    queueTable('follow_requests', { data: null, error: null })
    await expect(cancelFollowRequest('a', 'b')).resolves.toBeUndefined()
  })

  it('cancelFollowRequest throws on error', async () => {
    queueTable('follow_requests', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(cancelFollowRequest('a', 'b')).rejects.toBeDefined()
  })
})

describe('fetchIncomingFollowRequests', () => {
  it('returns [] when no requests', async () => {
    queueTable('follow_requests', { data: [], error: null })
    expect(await fetchIncomingFollowRequests('u-1')).toEqual([])
  })

  it('joins nicknames from public profiles', async () => {
    queueTable('follow_requests', {
      data: [
        {
          id: 'r-1',
          from_user_id: 'a',
          to_user_id: 'u-1',
          status: 'pending',
          created_at: '2026-04-15T12:00:00Z',
        },
      ],
      error: null,
    })
    queueTable('users', {
      data: [publicProfileRow({ id: 'a', nickname: 'Alice' })],
      error: null,
    })

    const result = await fetchIncomingFollowRequests('u-1')
    expect(result[0].fromUserNickname).toBe('Alice')
    expect(result[0].createdAt).toBeInstanceOf(Date)
  })

  it('falls back to Unknown when nickname is missing', async () => {
    queueTable('follow_requests', {
      data: [
        {
          id: 'r-1',
          from_user_id: 'a',
          to_user_id: 'u-1',
          status: 'pending',
          created_at: '2026-04-15T12:00:00Z',
        },
      ],
      error: null,
    })
    queueTable('users', { data: [], error: null })

    const result = await fetchIncomingFollowRequests('u-1')
    expect(result[0].fromUserNickname).toBe('Unknown')
  })

  it('throws on error', async () => {
    queueTable('follow_requests', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchIncomingFollowRequests('u-1')).rejects.toBeDefined()
  })
})

describe('fetchOutgoingFollowRequestIds', () => {
  it('returns an array of to_user_ids', async () => {
    queueTable('follow_requests', {
      data: [{ to_user_id: 'a' }, { to_user_id: 'b' }],
      error: null,
    })
    expect(await fetchOutgoingFollowRequestIds('u-1')).toEqual(['a', 'b'])
  })

  it('returns [] when data is null', async () => {
    queueTable('follow_requests', { data: null, error: null })
    expect(await fetchOutgoingFollowRequestIds('u-1')).toEqual([])
  })

  it('throws on error', async () => {
    queueTable('follow_requests', {
      data: null,
      error: { message: 'bad' },
    })
    await expect(fetchOutgoingFollowRequestIds('u-1')).rejects.toBeDefined()
  })
})

describe('acceptFollowRequest / rejectFollowRequest', () => {
  it('acceptFollowRequest resolves on success', async () => {
    queueTable('follow_requests', { data: null, error: null })
    await expect(acceptFollowRequest('r-1')).resolves.toBeUndefined()
  })

  it('acceptFollowRequest throws on error', async () => {
    queueTable('follow_requests', { data: null, error: { message: 'x' } })
    await expect(acceptFollowRequest('r-1')).rejects.toBeDefined()
  })

  it('rejectFollowRequest resolves on success', async () => {
    queueTable('follow_requests', { data: null, error: null })
    await expect(rejectFollowRequest('r-1')).resolves.toBeUndefined()
  })

  it('rejectFollowRequest throws on error', async () => {
    queueTable('follow_requests', { data: null, error: { message: 'x' } })
    await expect(rejectFollowRequest('r-1')).rejects.toBeDefined()
  })
})

describe('removeFollower', () => {
  it('resolves on success', async () => {
    queueTable('followers', { data: null, error: null })
    await expect(removeFollower('u-1', 't-1')).resolves.toBeUndefined()
  })

  it('throws on error', async () => {
    queueTable('followers', { data: null, error: { message: 'bad' } })
    await expect(removeFollower('u-1', 't-1')).rejects.toBeDefined()
  })
})

describe('toggleFollowRequest', () => {
  it('inserts into followers when target is public and add=true', async () => {
    queueTable('followers', { data: null, error: null })
    await toggleFollowRequest('u-1', 't-1', true, true)
    expect(getBuilder('followers').insert).toHaveBeenCalledWith({
      follower_id: 'u-1',
      following_id: 't-1',
    })
  })

  it('throws when follower insert fails', async () => {
    queueTable('followers', {
      data: null,
      error: { message: 'insert bad' },
    })
    await expect(
      toggleFollowRequest('u-1', 't-1', true, true),
    ).rejects.toBeDefined()
  })

  it('sends a follow request when target is private and add=true', async () => {
    queueTable('follow_requests', { data: null, error: null })
    await toggleFollowRequest('u-1', 't-1', true /* add */, false /* targetIsPublic */)
    expect(supabase.from).toHaveBeenCalledWith('follow_requests')
    expect(supabase.from).not.toHaveBeenCalledWith('followers')
  })

  it('calls removeFollower when removing an existing follow', async () => {
    queueTable('followers', { data: { id: 'f-1' }, error: null }) // lookup
    queueTable('followers', { data: null, error: null }) // delete

    await toggleFollowRequest('u-1', 't-1', false, true)

    expect(getBuilder('followers', 0).select).toHaveBeenCalled()
    expect(getBuilder('followers', 1).delete).toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalledWith('follow_requests')
  })

  it('cancels a pending follow request when no follower row exists', async () => {
    queueTable('followers', { data: null, error: null }) // lookup: none
    queueTable('follow_requests', { data: null, error: null }) // cancel

    await toggleFollowRequest('u-1', 't-1', false, true)

    expect(getBuilder('followers').select).toHaveBeenCalled()
    expect(getBuilder('follow_requests').delete).toHaveBeenCalled()
  })
})
