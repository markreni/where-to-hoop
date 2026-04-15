import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import AddHoop from '../../pages/AddHoop'
import type { BasketballHoop } from '../../types/types'
import { supabaseMockInstance, MOCK_USER } from '../services/supabaseMock'

// ── Mocks ──

vi.mock('../../components/MiniMap', () => ({
  MiniMap: ({
    onCoordinatesChange,
  }: {
    onCoordinatesChange: (c: { latitude: number; longitude: number }) => void
  }) => (
    <div data-testid="mini-map">
      <button
        type="button"
        onClick={() =>
          onCoordinatesChange({ latitude: 60.17, longitude: 24.94 })
        }
      >
        Set Location
      </button>
    </div>
  ),
}))

vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}))

vi.stubGlobal('URL', {
  ...URL,
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
})

const mockInsertHoop = vi.fn()
const mockUpdateHoop = vi.fn()
vi.mock('../../services/requests', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../services/requests')>()
  return {
    ...actual,
    insertHoop: (...args: unknown[]) => mockInsertHoop(...args),
    updateHoop: (...args: unknown[]) => mockUpdateHoop(...args),
    getHoopImageUrl: (p: string) => `https://mock/${p}`,
  }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Toast capture
const toastWarnings: string[] = []
const toastErrors: string[] = []
const toastSuccesses: string[] = []
vi.mock('../../contexts/ToastContext', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../contexts/ToastContext')>()
  return {
    ...actual,
    useToast: () => ({
      success: (m: string) => toastSuccesses.push(m),
      error: (m: string) => toastErrors.push(m),
      warning: (m: string) => toastWarnings.push(m),
    }),
  }
})

// Fill the full form so submit is enabled.
const fillCompleteForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByPlaceholderText('e.g., Central Park Court'),
    'Test Court',
  )
  await user.click(screen.getByRole('button', { name: 'Set Location' }))
  await user.click(screen.getByRole('button', { name: /Excellent/i }))
  await user.click(screen.getByRole('button', { name: /Outdoor/i }))
  await user.click(screen.getByRole('button', { name: /Gratis/i }))

  const fileInput = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement
  const file = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' })
  await user.upload(fileInput, file)

  await waitFor(() => {
    expect(screen.getByText('6/6 required')).toBeInTheDocument()
  })
}

// ── Tests ──

describe('AddHoop — submit (add mode)', () => {
  beforeEach(() => {
    mockInsertHoop.mockReset()
    mockUpdateHoop.mockReset()
    mockNavigate.mockReset()
    toastWarnings.length = 0
    toastErrors.length = 0
    toastSuccesses.length = 0
    supabaseMockInstance.setSession({ user: MOCK_USER })
  })

  it('calls insertHoop and navigates on success', async () => {
    mockInsertHoop.mockResolvedValue({ id: 'new-hoop-42' })
    const user = userEvent.setup()

    render(<AddHoop />)
    await fillCompleteForm(user)
    await user.click(screen.getByRole('button', { name: 'Add Hoop' }))

    await waitFor(() => {
      expect(mockInsertHoop).toHaveBeenCalledOnce()
    })
    const [hoopArg, filesArg, userIdArg] = mockInsertHoop.mock.calls[0]
    expect(hoopArg.name).toBe('Test Court')
    expect(hoopArg.condition).toBe('excellent')
    expect(hoopArg.isIndoor).toBe(false)
    expect(hoopArg.isPaid).toBe(false)
    expect(hoopArg.coordinates).toEqual({ latitude: 60.17, longitude: 24.94 })
    expect(filesArg).toHaveLength(1)
    expect(userIdArg).toBe('mock-user-id')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/hoops/new-hoop-42')
    })
    expect(toastSuccesses.length).toBeGreaterThan(0)
  })

  it('shows sign-in required toast on 42501 error', async () => {
    mockInsertHoop.mockRejectedValue({ code: '42501' })
    const user = userEvent.setup()

    render(<AddHoop />)
    await fillCompleteForm(user)
    await user.click(screen.getByRole('button', { name: 'Add Hoop' }))

    await waitFor(() => {
      expect(toastErrors.length).toBeGreaterThan(0)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows generic submit-failed toast on other errors', async () => {
    mockInsertHoop.mockRejectedValue({ code: 'something-else' })
    const user = userEvent.setup()

    render(<AddHoop />)
    await fillCompleteForm(user)
    await user.click(screen.getByRole('button', { name: 'Add Hoop' }))

    await waitFor(() => {
      expect(toastErrors.length).toBeGreaterThan(0)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('AddHoop — image upload validation', () => {
  beforeEach(() => {
    toastWarnings.length = 0
  })

  it('warns when an image exceeds the size limit', async () => {
    const user = userEvent.setup()
    render(<AddHoop />)

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const bigFile = new File(
      [new Uint8Array(11 * 1024 * 1024)], // 11 MB, over 10 MB limit
      'huge.jpg',
      { type: 'image/jpeg' },
    )

    await user.upload(fileInput, bigFile)

    expect(toastWarnings.length).toBeGreaterThan(0)
    // The oversized file should have been rejected → still 0 images
    expect(screen.getByText('0/3')).toBeInTheDocument()
  })

  it('warns and trims when uploading more images than remaining slots', async () => {
    const user = userEvent.setup()
    render(<AddHoop />)

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const files = [
      new File(['a'], '1.jpg', { type: 'image/jpeg' }),
      new File(['b'], '2.jpg', { type: 'image/jpeg' }),
      new File(['c'], '3.jpg', { type: 'image/jpeg' }),
      new File(['d'], '4.jpg', { type: 'image/jpeg' }),
    ]

    await user.upload(fileInput, files)

    expect(toastWarnings.length).toBeGreaterThan(0)
    // Capped at 3
    expect(screen.getByText('3/3')).toBeInTheDocument()
  })

  it('allows removing a newly uploaded image', async () => {
    const user = userEvent.setup()
    render(<AddHoop />)

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(
      fileInput,
      new File(['a'], 'one.jpg', { type: 'image/jpeg' }),
    )

    expect(screen.getByText('1/3')).toBeInTheDocument()

    const removeButtons = document.querySelectorAll('button.bg-red-500')
    expect(removeButtons.length).toBeGreaterThan(0)
    await user.click(removeButtons[0] as HTMLElement)

    expect(screen.getByText('0/3')).toBeInTheDocument()
  })
})

describe('AddHoop — edit mode', () => {
  const existingHoop: BasketballHoop = {
    id: 'existing-1',
    name: 'Existing Court',
    createdAt: '2024-01-10T10:00:00Z',
    images: [{ id: 1, imagePath: 'x.jpg', addedDate: '2024-01-10' }],
    coordinates: { latitude: 60.17, longitude: 24.94 },
    description: { fi: '', en: 'A good court' },
    condition: 'good',
    isIndoor: false,
    isPaid: false,
    isVerified: false,
    addedBy: 'someone',
  }

  beforeEach(() => {
    mockUpdateHoop.mockReset()
    mockNavigate.mockReset()
    toastSuccesses.length = 0
    toastErrors.length = 0
    supabaseMockInstance.setSession({ user: MOCK_USER })
  })

  it('renders edit title and prefills the name field', () => {
    render(<AddHoop hoop={existingHoop} />)
    expect(screen.getByDisplayValue('Existing Court')).toBeInTheDocument()
  })

  it('shows Update button instead of Add Hoop', () => {
    render(<AddHoop hoop={existingHoop} />)
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('navigates to /admin when Cancel is clicked', async () => {
    render(<AddHoop hoop={existingHoop} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })

  it('calls updateHoop and navigates to /admin on successful update', async () => {
    mockUpdateHoop.mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<AddHoop hoop={existingHoop} />)
    // Form is already valid — just click Update
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => {
      expect(mockUpdateHoop).toHaveBeenCalledOnce()
    })
    expect(mockUpdateHoop.mock.calls[0][0]).toBe('existing-1')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('shows error toast when updateHoop fails', async () => {
    mockUpdateHoop.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()

    render(<AddHoop hoop={existingHoop} />)
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => {
      expect(toastErrors.length).toBeGreaterThan(0)
    })
  })

  it('removes an existing image when its close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddHoop hoop={existingHoop} />)

    const removeButtons = document.querySelectorAll('button.bg-red-500')
    expect(removeButtons.length).toBeGreaterThan(0)
    await user.click(removeButtons[0] as HTMLElement)

    // After removal, the total image count drops to 0
    expect(screen.getByText('0/3')).toBeInTheDocument()
  })
})
