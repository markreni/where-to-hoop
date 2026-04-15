import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import NavBar from '../../components/NavBar'

vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(() => true), // desktop
}))

vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}))

const mockSignOut = vi.fn()
let mockUser: { id: string; user_metadata?: { nickname?: string } } | null = null
let mockIsAdmin = false

vi.mock('../../contexts/AuthContext.tsx', async () => {
  const actual =
    await vi.importActual<typeof import('../../contexts/AuthContext.tsx')>(
      '../../contexts/AuthContext.tsx',
    )
  return {
    ...actual,
    useAuth: () => ({ user: mockUser, signOut: mockSignOut }),
  }
})

vi.mock('../../hooks/useIsAdmin.ts', () => ({
  default: () => ({ isAdmin: mockIsAdmin, isLoading: false }),
}))

const openMenu = async () => {
  const menuButton = screen
    .getAllByRole('button')
    .find((b) => b.getAttribute('aria-haspopup') === 'true')!
  await userEvent.click(menuButton)
}

describe('NavBar — authenticated user', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockUser = { id: 'u1', user_metadata: { nickname: 'MockUser' } }
    mockIsAdmin = false
  })

  it('shows My Account and Sign Out buttons when authenticated', () => {
    render(<NavBar />)
    expect(screen.getByText(/my account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign out/i)).toBeInTheDocument()
  })

  it('hides Sign In link when user is present', () => {
    render(<NavBar />)
    expect(screen.queryByText(/^Sign In$/)).not.toBeInTheDocument()
  })

  it('shows Add Hoop menu item when authenticated', async () => {
    render(<NavBar />)
    await openMenu()
    expect(screen.getByText(/add hoop/i)).toBeInTheDocument()
  })

  it('shows Find Friend menu item when authenticated', async () => {
    render(<NavBar />)
    await openMenu()
    // translation key nav.findFriend
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
    const link = menu.querySelector('a[href="/search-players"]')
    expect(link).toBeInTheDocument()
  })

  it('does not show Admin link for non-admin user', async () => {
    render(<NavBar />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(menu.querySelector('a[href="/admin"]')).toBeNull()
  })

  it('calls signOut when Sign Out button is pressed', async () => {
    render(<NavBar />)
    const signOutButton = screen.getByText(/sign out/i).closest('button')!
    await userEvent.click(signOutButton)
    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})

describe('NavBar — admin user', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockUser = { id: 'admin-1', user_metadata: { nickname: 'Admin' } }
    mockIsAdmin = true
  })

  it('shows Admin link in menu for admins', async () => {
    render(<NavBar />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(menu.querySelector('a[href="/admin"]')).toBeInTheDocument()
  })
})

describe('NavBar — unauthenticated user', () => {
  beforeEach(() => {
    mockUser = null
    mockIsAdmin = false
  })

  it('shows Sign In button in top bar', () => {
    render(<NavBar />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows Sign Up menu item in drawer menu', async () => {
    render(<NavBar />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(menu.querySelector('a[href="/signup"]')).toBeInTheDocument()
  })

  it('does not show Add Hoop menu item when unauthenticated', async () => {
    render(<NavBar />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(menu.querySelector('a[href="/addhoop"]')).toBeNull()
  })

  it('does not show Admin link even if unauthenticated', async () => {
    render(<NavBar />)
    await openMenu()
    const menu = screen.getByRole('menu')
    expect(menu.querySelector('a[href="/admin"]')).toBeNull()
  })
})
