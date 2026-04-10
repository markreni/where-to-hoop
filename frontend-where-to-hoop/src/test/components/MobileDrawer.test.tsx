import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import MobileDrawer from '../../components/MobileDrawer';

// Mock useLocateUser
const mockLocateUser = vi.fn();
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => mockLocateUser,
}));

// Mock useIsAdmin – default to non-admin
const mockIsAdmin = { isAdmin: false, isLoading: false };
vi.mock('../../hooks/useIsAdmin', () => ({
  default: () => mockIsAdmin,
}));

describe('MobileDrawer', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockLocateUser.mockClear();
    mockIsAdmin.isAdmin = false;
    document.body.style.overflow = '';
  });

  // ── Closed state ──

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MobileDrawer isOpen={false} onClose={mockOnClose} />
    );
    expect(container.innerHTML).toBe('');
  });

  // ── Open state – authenticated user ──

  it('renders drawer with user info when open and authenticated', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('MockUser')).toBeInTheDocument();
    });
    expect(screen.getByText('mock@example.com')).toBeInTheDocument();
  });

  it('renders Explore section with Show Hoops and Add Hoop links', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Explore')).toBeInTheDocument();
    });
    expect(screen.getByText('Show Hoops')).toBeInTheDocument();
    expect(screen.getByText('Add Hoop')).toBeInTheDocument();

    const showHoopsLink = screen.getByText('Show Hoops').closest('a');
    expect(showHoopsLink).toHaveAttribute('href', '/hoops');

    const addHoopLink = screen.getByText('Add Hoop').closest('a');
    expect(addHoopLink).toHaveAttribute('href', '/addhoop');
  });

  it('renders Community section with Players and Find Friend links', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Community')).toBeInTheDocument();
    });
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Find Friend')).toBeInTheDocument();

    const playersLink = screen.getByText('Players').closest('a');
    expect(playersLink).toHaveAttribute('href', '/players');

    const findFriendLink = screen.getByText('Find Friend').closest('a');
    expect(findFriendLink).toHaveAttribute('href', '/search-players');
  });

  it('renders Account section with My Account link', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
    expect(screen.getByText('My Account')).toBeInTheDocument();

    const myAccountLink = screen.getByText('My Account').closest('a');
    expect(myAccountLink).toHaveAttribute('href', '/myprofile');
  });

  it('renders Sign Out button for authenticated user', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('does not render Sign In / Sign Up when authenticated', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('MockUser')).toBeInTheDocument();
    });
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  // ── Admin link ──

  it('does not render Admin link for non-admin user', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('MockUser')).toBeInTheDocument();
    });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders Admin link when user is admin', async () => {
    mockIsAdmin.isAdmin = true;
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
    const adminLink = screen.getByText('Admin').closest('a');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  // ── Interactions ──

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('MockUser')).toBeInTheDocument();
    });

    // Backdrop is the first fixed div (bg-black/50)
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeTruthy();
    await user.click(backdrop!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('MockUser')).toBeInTheDocument();
    });

    // Close button is in the drawer panel
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // First button is the close button
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls signOut and onClose when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Sign Out'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls locateUser when Show Hoops is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Show Hoops')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Show Hoops'));
    expect(mockLocateUser).toHaveBeenCalled();
  });

  // ── Body scroll lock ──

  it('sets body overflow to hidden when open', async () => {
    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} />
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<MobileDrawer isOpen={false} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe('');
  });

  // ── Unauthenticated state ──

  it('renders Sign In and Sign Up when not authenticated', async () => {
    // Override Supabase mocks to simulate no session
    const supabase = await import('../../utils/supabase');
    const mock = vi.mocked(supabase.default);
    mock.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mock.auth.onAuthStateChange = vi.fn((cb: any) => {
      cb('SIGNED_OUT', null);
      return { data: { subscription: { id: '', callback: vi.fn(), unsubscribe: vi.fn() } } };
    });

    render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    expect(screen.getByText('Sign Up')).toBeInTheDocument();

    const signInLink = screen.getByText('Sign In').closest('a');
    expect(signInLink).toHaveAttribute('href', '/signin');

    const signUpLink = screen.getByText('Sign Up').closest('a');
    expect(signUpLink).toHaveAttribute('href', '/signup');

    // Should not render authenticated-only items
    expect(screen.queryByText('Add Hoop')).not.toBeInTheDocument();
    expect(screen.queryByText('Find Friend')).not.toBeInTheDocument();
    expect(screen.queryByText('My Account')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();

    // Restore original mocks
    mock.auth.getSession = vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            user_metadata: { nickname: 'MockUser' },
          },
        },
      },
      error: null,
    });
    mock.auth.onAuthStateChange = vi.fn((cb: any) => {
      cb('SIGNED_IN', {
        user: {
          id: 'mock-user-id',
          email: 'mock@example.com',
          user_metadata: { nickname: 'MockUser' },
        },
      });
      return { data: { subscription: { id: '', callback: vi.fn(), unsubscribe: vi.fn() } } };
    });
  });
});
