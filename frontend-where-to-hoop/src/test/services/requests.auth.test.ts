import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseMockInstance } from './supabaseMock'

vi.mock('../../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

import {
  signUp,
  signIn,
  uploadProfileImage,
  removeProfileImage,
  adminRemoveProfileImage,
} from '../../services/requests'

const { queueTable, storageUpload, storageRemove, supabase } =
  supabaseMockInstance

beforeEach(() => {
  supabaseMockInstance.reset()
  supabaseMockInstance.setStrictQueue(true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signUp', () => {
  it('throws when nickname is shorter than 3 characters', async () => {
    await expect(signUp('a@b.com', 'pw', 'ab', true)).rejects.toThrow(
      /at least 3/i,
    )
  })

  it('throws when the nickname RPC check fails', async () => {
    supabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'rpc bad' },
    })
    await expect(signUp('a@b.com', 'pw', 'Nick', true)).rejects.toBeDefined()
  })

  it('throws when the nickname is already taken', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: true, error: null })
    await expect(signUp('a@b.com', 'pw', 'Nick', true)).rejects.toThrow(
      /already taken/i,
    )
  })

  it('maps 429 errors to a rate-limit message', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: false, error: null })
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { status: 429, message: 'rate limit' },
    })
    await expect(signUp('a@b.com', 'pw', 'Nick', true)).rejects.toThrow(
      /too many attempts/i,
    )
  })

  it('rethrows non-429 signup errors', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: false, error: null })
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { status: 400, message: 'bad email' },
    })
    await expect(
      signUp('a@b.com', 'pw', 'Nick', true),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('returns data on successful signup', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: false, error: null })
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new' } },
      error: null,
    })
    const result = await signUp('a@b.com', 'pw', 'Nick', true)
    expect(result).toEqual({ user: { id: 'new' } })
  })
})

describe('signIn', () => {
  it('returns data on success', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: { user: { id: 'u-1' } } },
      error: null,
    })
    const result = await signIn('a@b.com', 'pw')
    expect(result.session?.user.id).toBe('u-1')
  })

  it('throws on error', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'bad creds' },
    })
    await expect(signIn('a@b.com', 'pw')).rejects.toBeDefined()
  })
})

describe('uploadProfileImage', () => {
  const file = new File(['x'], 'me.jpg', { type: 'image/jpeg' })

  it('uploads, writes DB + auth, cleans up old image, and returns the new image', async () => {
    // DB update: users
    queueTable('users', { data: null, error: null })

    const result = await uploadProfileImage('u-1', file, {
      imagePath: 'old.jpg',
      uploadedAt: '2024-01-01T00:00:00Z',
    })

    expect(storageUpload).toHaveBeenCalledOnce()
    expect(supabase.auth.updateUser).toHaveBeenCalled()
    // Old image removed
    expect(storageRemove).toHaveBeenCalledWith(['old.jpg'])
    expect(result.imagePath).toMatch(/u-1\/profile-/)
  })

  it('throws when storage upload fails', async () => {
    storageUpload.mockResolvedValueOnce({ error: { message: 'up bad' } })
    await expect(
      uploadProfileImage('u-1', file, null),
    ).rejects.toBeDefined()
  })

  it('rolls back storage when DB update fails', async () => {
    queueTable('users', { data: null, error: { message: 'db bad' } })
    await expect(
      uploadProfileImage('u-1', file, null),
    ).rejects.toBeDefined()
    // Uploaded file should be removed
    expect(storageRemove).toHaveBeenCalled()
  })

  it('rolls back storage and DB to previous image when auth update fails', async () => {
    // Initial DB update
    queueTable('users', { data: null, error: null })
    // Rollback DB update (restore old image)
    queueTable('users', { data: null, error: null })
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: {},
      error: { message: 'auth bad' },
    })

    await expect(
      uploadProfileImage('u-1', file, {
        imagePath: 'old.jpg',
        uploadedAt: '2024-01-01T00:00:00Z',
      }),
    ).rejects.toBeDefined()

    // New image removed from storage
    expect(storageRemove).toHaveBeenCalled()
  })

  it('clears DB profile_image when auth update fails and there was no previous image', async () => {
    queueTable('users', { data: null, error: null })
    queueTable('users', { data: null, error: null })
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: {},
      error: { message: 'auth bad' },
    })

    await expect(
      uploadProfileImage('u-1', file, null),
    ).rejects.toBeDefined()
  })

  it('does not throw when removing the old image fails', async () => {
    queueTable('users', { data: null, error: null })
    // First storage.remove call (the old image cleanup) returns an error
    storageRemove.mockResolvedValueOnce({ error: { message: 'remove bad' } })

    await expect(
      uploadProfileImage('u-1', file, {
        imagePath: 'old.jpg',
        uploadedAt: '2024-01-01T00:00:00Z',
      }),
    ).resolves.toBeDefined()
  })
})

describe('removeProfileImage', () => {
  it('updates DB, auth, and removes storage when image is provided', async () => {
    queueTable('users', { data: null, error: null })

    await removeProfileImage('u-1', {
      imagePath: 'me.jpg',
      uploadedAt: '2024-01-01T00:00:00Z',
    })

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { profile_image: null },
    })
    expect(storageRemove).toHaveBeenCalledWith(['me.jpg'])
  })

  it('skips storage removal when no image is provided', async () => {
    queueTable('users', { data: null, error: null })
    await removeProfileImage('u-1', null)
    expect(storageRemove).not.toHaveBeenCalled()
  })

  it('throws when DB update fails', async () => {
    queueTable('users', { data: null, error: { message: 'db bad' } })
    await expect(
      removeProfileImage('u-1', { imagePath: 'x', uploadedAt: 't' }),
    ).rejects.toBeDefined()
  })

  it('rolls back DB when auth update fails', async () => {
    queueTable('users', { data: null, error: null }) // initial remove
    queueTable('users', { data: null, error: null }) // rollback
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: {},
      error: { message: 'auth bad' },
    })

    await expect(
      removeProfileImage('u-1', { imagePath: 'x.jpg', uploadedAt: 't' }),
    ).rejects.toBeDefined()

    // Two from() calls = initial update + rollback
    expect(supabase.from).toHaveBeenCalledTimes(2)
  })

  it('does not throw when storage removal fails', async () => {
    queueTable('users', { data: null, error: null })
    storageRemove.mockResolvedValueOnce({
      error: { message: 'storage bad' },
    })
    await expect(
      removeProfileImage('u-1', { imagePath: 'x.jpg', uploadedAt: 't' }),
    ).resolves.toBeUndefined()
  })
})

describe('adminRemoveProfileImage', () => {
  it('removes the profile image and cleans up storage', async () => {
    queueTable('users', { data: [{ id: 'u-1' }], error: null })
    await adminRemoveProfileImage('u-1', 'img.jpg')
    expect(storageRemove).toHaveBeenCalledWith(['img.jpg'])
  })

  it('throws when DB update fails', async () => {
    queueTable('users', { data: null, error: { message: 'db bad' } })
    await expect(
      adminRemoveProfileImage('u-1', 'img.jpg'),
    ).rejects.toBeDefined()
  })

  it('throws when no rows are affected (RLS block)', async () => {
    queueTable('users', { data: [], error: null })
    await expect(
      adminRemoveProfileImage('u-1', 'img.jpg'),
    ).rejects.toThrow(/no rows affected/i)
  })

  it('does not throw when storage removal fails', async () => {
    queueTable('users', { data: [{ id: 'u-1' }], error: null })
    storageRemove.mockResolvedValueOnce({
      error: { message: 'storage bad' },
    })
    await expect(
      adminRemoveProfileImage('u-1', 'img.jpg'),
    ).resolves.toBeUndefined()
  })
})
