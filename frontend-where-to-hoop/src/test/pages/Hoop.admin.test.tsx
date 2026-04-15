import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import Hoop from '../../pages/Hoop'
import type { BasketballHoop } from '../../types/types'
import { supabaseMockInstance, MOCK_USER } from '../services/supabaseMock'

// ── Mocks ──

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

let mockIsAdmin = false
vi.mock('../../hooks/useIsAdmin', () => ({
  default: () => ({ isAdmin: mockIsAdmin, isLoading: false }),
}))

const mockDeleteHoop = vi.fn()
const mockFetchHoopEnrollments = vi.fn().mockResolvedValue([])
vi.mock('../../services/requests', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../services/requests')>()
  return {
    ...actual,
    deleteHoop: (...args: [string]) => mockDeleteHoop(...args),
    fetchHoopEnrollments: (...args: [string]) =>
      mockFetchHoopEnrollments(...args),
  }
})

const mockToggleFavorite = vi.fn()
let mockIsFavorited = false
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorited: () => mockIsFavorited,
    toggleFavorite: mockToggleFavorite,
    favoriteIds: [],
    isLoading: false,
  }),
}))

// ── Fixture ──

const baseHoop: BasketballHoop = {
  id: 'hoop-1',
  name: 'Central Park Court',
  createdAt: '2024-01-10T10:00:00Z',
  images: [
    { id: 1, imagePath: 'a.jpg', addedDate: '2024-01-10' },
  ],
  coordinates: { latitude: 60.17, longitude: 24.94 },
  description: { fi: '', en: 'Great court' },
  condition: 'excellent',
  isIndoor: false,
  isPaid: false,
  isVerified: false,
  addedBy: 'test@example.com',
}

// ── Tests ──

describe('Hoop page — non-admin', () => {
  beforeEach(() => {
    mockIsAdmin = false
    mockNavigate.mockReset()
    mockDeleteHoop.mockReset()
  })

  it('does not render admin Edit/Delete buttons', () => {
    render(<Hoop hoop={baseHoop} />)
    expect(screen.queryByLabelText(/edit hoop/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/delete hoop/i)).not.toBeInTheDocument()
  })
})

describe('Hoop page — admin delete', () => {
  beforeEach(() => {
    mockIsAdmin = true
    mockNavigate.mockReset()
    mockDeleteHoop.mockReset()
  })

  it('renders admin Edit and Delete buttons', () => {
    render(<Hoop hoop={baseHoop} />)
    expect(screen.getByLabelText(/edit hoop/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delete hoop/i)).toBeInTheDocument()
  })

  it('navigates to edit page when Edit is clicked', async () => {
    render(<Hoop hoop={baseHoop} />)
    await userEvent.click(screen.getByLabelText(/edit hoop/i))
    expect(mockNavigate).toHaveBeenCalledWith('/admin/edit/hoop-1')
  })

  it('does not call deleteHoop when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<Hoop hoop={baseHoop} />)
    await userEvent.click(screen.getByLabelText(/delete hoop/i))
    expect(mockDeleteHoop).not.toHaveBeenCalled()
  })

  it('calls deleteHoop and navigates on successful delete', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockDeleteHoop.mockResolvedValue({ ...baseHoop })
    render(<Hoop hoop={baseHoop} />)

    await userEvent.click(screen.getByLabelText(/delete hoop/i))

    await waitFor(() => {
      expect(mockDeleteHoop).toHaveBeenCalledWith('hoop-1')
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/hoops')
    })
  })

  it('does not navigate when delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockDeleteHoop.mockRejectedValue(new Error('boom'))
    render(<Hoop hoop={baseHoop} />)

    await userEvent.click(screen.getByLabelText(/delete hoop/i))

    await waitFor(() => {
      expect(mockDeleteHoop).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalledWith('/hoops')
  })
})

describe('Hoop page — favorites', () => {
  beforeEach(() => {
    mockIsAdmin = false
    mockIsFavorited = false
    mockToggleFavorite.mockReset()
    supabaseMockInstance.setSession({ user: MOCK_USER })
  })

  it('shows outline heart when not favorited, and toggles on click', async () => {
    render(<Hoop hoop={baseHoop} />)
    const heart = screen
      .getAllByLabelText(/add to favorites/i)
      .find((el) => el.tagName.toLowerCase() === 'svg')!
    await userEvent.click(heart)
    expect(mockToggleFavorite).toHaveBeenCalledWith('hoop-1')
  })

  it('shows filled heart when favorited', () => {
    mockIsFavorited = true
    render(<Hoop hoop={baseHoop} />)
    // Filled heart has red-500 class applied
    const heart = screen
      .getAllByLabelText(/add to favorites/i)
      .find((el) => el.tagName.toLowerCase() === 'svg')!
    expect(heart).toHaveClass('text-red-500')
  })
})
