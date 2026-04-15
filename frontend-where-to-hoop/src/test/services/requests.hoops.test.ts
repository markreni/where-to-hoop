import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseMockInstance } from './supabaseMock'

vi.mock('../../utils/supabase', () => ({
  default: supabaseMockInstance.supabase,
}))

import {
  fetchHoops,
  insertHoop,
  updateHoop,
  deleteHoop,
  toggleHoopVerification,
  getHoopImageUrl,
  getProfileImageUrl,
} from '../../services/requests'
import type { BasketballHoop } from '../../types/types'

const { queueTable, getBuilder, storageUpload, storageRemove, storagePublicUrl, supabase } =
  supabaseMockInstance

const dbRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'hoop-1',
  name: 'Court',
  description: { fi: '', en: 'desc' },
  condition: 'excellent',
  is_indoor: false,
  is_paid: false,
  is_verified: false,
  created_at: '2024-01-10T10:00:00Z',
  added_by: 'me',
  address: 'Some street',
  images: [{ id: 1, imagePath: 'p.jpg', addedDate: '2024-01-10' }],
  latitude: 60.17,
  longitude: 24.94,
  ...overrides,
})

const baseHoop: Omit<BasketballHoop, 'id'> = {
  name: 'New Court',
  description: { fi: '', en: 'desc' },
  condition: 'good',
  isIndoor: false,
  isPaid: false,
  isVerified: false,
  createdAt: '2024-01-10T10:00:00Z',
  addedBy: 'me',
  images: [],
  coordinates: { latitude: 60.17, longitude: 24.94 },
}

beforeEach(() => {
  supabaseMockInstance.reset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('fetchHoops', () => {
  it('maps snake_case DB rows to camelCase hoops', async () => {
    queueTable('basketball_hoop', { data: [dbRow()], error: null })

    const result = await fetchHoops()

    expect(supabase.from).toHaveBeenCalledWith('basketball_hoop')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'hoop-1',
      name: 'Court',
      isIndoor: false,
      isPaid: false,
      isVerified: false,
      coordinates: { latitude: 60.17, longitude: 24.94 },
    })
  })

  it('returns empty array when data is null', async () => {
    queueTable('basketball_hoop', { data: null, error: null })
    const result = await fetchHoops()
    expect(result).toEqual([])
  })

  it('throws when supabase returns an error', async () => {
    queueTable('basketball_hoop', {
      data: null,
      error: { message: 'boom' },
    })
    await expect(fetchHoops()).rejects.toMatchObject({ message: 'boom' })
  })
})

describe('insertHoop', () => {
  it('uploads all images then inserts the row and returns the mapped hoop', async () => {
    queueTable('basketball_hoop', {
      data: dbRow({ id: 'new-42' }),
      error: null,
    })
    const files = [
      new File(['a'], '1.jpg', { type: 'image/jpeg' }),
      new File(['b'], '2.jpg', { type: 'image/jpeg' }),
    ]

    const result = await insertHoop(baseHoop, files, 'user-1')

    expect(storageUpload).toHaveBeenCalledTimes(2)
    expect(result.id).toBe('new-42')
    expect(result.coordinates).toEqual({ latitude: 60.17, longitude: 24.94 })
  })

  it('cleans up already-uploaded files when a later upload fails', async () => {
    storageUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'upload failed' } })

    const files = [
      new File(['a'], '1.jpg', { type: 'image/jpeg' }),
      new File(['b'], '2.jpg', { type: 'image/jpeg' }),
    ]

    await expect(insertHoop(baseHoop, files, 'user-1')).rejects.toBeDefined()
    expect(storageRemove).toHaveBeenCalled()
  })

  it('cleans up uploaded files when the DB insert fails', async () => {
    queueTable('basketball_hoop', {
      data: null,
      error: { message: 'insert failed' },
    })
    const files = [new File(['a'], '1.jpg', { type: 'image/jpeg' })]

    await expect(insertHoop(baseHoop, files, 'user-1')).rejects.toMatchObject({
      message: 'insert failed',
    })
    expect(storageRemove).toHaveBeenCalled()
  })
})

describe('updateHoop', () => {
  const updateFields = {
    name: 'Renamed',
    description: { fi: '', en: 'new desc' },
    condition: 'good',
    isIndoor: false,
    isPaid: false,
    coordinates: { latitude: 60.17, longitude: 24.94 },
    address: 'Street 1',
  }

  it('updates the row with kept + new images and returns the mapped hoop', async () => {
    queueTable('basketball_hoop', {
      data: dbRow({ id: 'edit-1', name: 'Renamed' }),
      error: null,
    })
    const newFile = new File(['x'], 'new.jpg', { type: 'image/jpeg' })

    const result = await updateHoop(
      'edit-1',
      updateFields,
      [newFile],
      ['old-path.jpg'],
      [{ id: 1, imagePath: 'kept.jpg', addedDate: '2024-01-01' }],
      'user-1',
      false,
    )

    expect(storageUpload).toHaveBeenCalledOnce()
    expect(storageRemove).toHaveBeenCalledWith(['old-path.jpg'])
    expect(result.name).toBe('Renamed')
  })

  it('rolls back uploaded images when DB update fails', async () => {
    queueTable('basketball_hoop', {
      data: null,
      error: { message: 'update failed' },
    })
    const newFile = new File(['x'], 'new.jpg', { type: 'image/jpeg' })

    await expect(
      updateHoop('x', updateFields, [newFile], [], [], 'user-1'),
    ).rejects.toMatchObject({ message: 'update failed' })

    // Upload happens, then storage.remove is called to clean up
    expect(storageUpload).toHaveBeenCalledOnce()
    expect(storageRemove).toHaveBeenCalled()
  })

  it('puts new images first when profileIsNewImage is true', async () => {
    queueTable('basketball_hoop', { data: dbRow(), error: null })
    const newFile = new File(['x'], 'new.jpg', { type: 'image/jpeg' })

    await updateHoop(
      'edit-1',
      updateFields,
      [newFile],
      [],
      [{ id: 99, imagePath: 'kept.jpg', addedDate: '2024-01-01' }],
      'user-1',
      true, // profileIsNewImage
    )

    const builder = getBuilder('basketball_hoop')
    expect(builder.update).toHaveBeenCalledOnce()
    const updatePayload = builder.update.mock.calls[0][0] as { images: { imagePath: string }[] }
    expect(updatePayload.images[0].imagePath).toMatch(/new\.jpg$/)
  })
})

describe('deleteHoop', () => {
  it('deletes the row and removes associated images from storage', async () => {
    queueTable('basketball_hoop', {
      data: dbRow({
        images: [{ id: 1, imagePath: 'a.jpg', addedDate: '2024-01-01' }],
      }),
      error: null,
    })

    const result = await deleteHoop('hoop-1')
    expect(result.id).toBe('hoop-1')
    expect(storageRemove).toHaveBeenCalledWith(['a.jpg'])
  })

  it('skips storage removal when the hoop has no images', async () => {
    queueTable('basketball_hoop', { data: dbRow({ images: [] }), error: null })
    await deleteHoop('hoop-1')
    expect(storageRemove).not.toHaveBeenCalled()
  })

  it('throws when the delete fails', async () => {
    queueTable('basketball_hoop', {
      data: null,
      error: { message: 'delete failed' },
    })
    await expect(deleteHoop('hoop-1')).rejects.toMatchObject({
      message: 'delete failed',
    })
  })
})

describe('toggleHoopVerification', () => {
  it('updates the is_verified column', async () => {
    queueTable('basketball_hoop', { data: null, error: null })
    await toggleHoopVerification('hoop-1', true)
    expect(supabase.from).toHaveBeenCalledWith('basketball_hoop')
  })

  it('throws when update fails', async () => {
    queueTable('basketball_hoop', {
      data: null,
      error: { message: 'nope' },
    })
    await expect(toggleHoopVerification('hoop-1', false)).rejects.toMatchObject(
      { message: 'nope' },
    )
  })
})

describe('image URL helpers', () => {
  it('getHoopImageUrl returns the public URL from the hoop-images bucket', () => {
    const url = getHoopImageUrl('foo.jpg')
    expect(url).toBe('https://mock-storage/foo.jpg')
    expect(supabase.storage.from).toHaveBeenCalledWith('hoop-images')
    expect(storagePublicUrl).toHaveBeenCalledWith('foo.jpg')
  })

  it('getProfileImageUrl returns the public URL from the profile-images bucket', () => {
    const url = getProfileImageUrl('me.jpg')
    expect(url).toBe('https://mock-storage/me.jpg')
    expect(supabase.storage.from).toHaveBeenCalledWith('profile-images')
  })
})
