import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import Hoop from '../../pages/Hoop';
import type { BasketballHoop } from '../../types/types';
import { fetchHoopEnrollments } from '../../utils/requests';

const mockEnrollments = vi.hoisted(() => [
  {
    id: 'enroll-1',
    playerId: 'user-alice',
    playerNickname: 'Alice',
    hoopId: 'test-hoop-1',
    arrivalTime: new Date(new Date('2024-01-15T12:00:00Z').getTime() - 10 * 60000),
    duration: 60,
    expired: false,
    playMode: 'open' as const,
    createdAt: new Date(new Date('2024-01-15T12:00:00Z').getTime() - 15 * 60000),
  },
  {
    id: 'enroll-2',
    playerId: 'user-bob',
    playerNickname: 'Bob',
    hoopId: 'test-hoop-1',
    arrivalTime: new Date(new Date('2024-01-15T12:00:00Z').getTime() + 20 * 60000),
    duration: 90,
    expired: false,
    playMode: 'solo' as const,
    createdAt: new Date(new Date('2024-01-15T12:00:00Z').getTime() - 5 * 60000),
  },
]);

vi.mock('../../utils/requests', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/requests')>();
  return {
    ...actual,
    fetchHoopEnrollments: vi.fn().mockResolvedValue(mockEnrollments),
  };
});

describe('Hoop Page', () => {
  const fixedNow = new Date('2024-01-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockHoop: BasketballHoop = {
    id: 'test-hoop-1',
    name: 'Central Park Court',
    createdAt: '2024-01-10T10:00:00Z',
    images: [
      { id: 1, imagePath: 'https://example.com/court.jpg', addedDate: '2024-01-10' },
    ],
    coordinates: { latitude: 60.1699, longitude: 24.9384 },
    description: 'Great outdoor court with good lighting and two hoops',
    condition: 'excellent',
    isIndoor: false,
    addedBy: 'test@example.com',
  };

  it('renders hoop name', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
  });

  it('renders hoop description', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText('Great outdoor court with good lighting and two hoops')).toBeInTheDocument();
  });

  it('renders hoop image', () => {
    render(<Hoop hoop={mockHoop} />);
    const image = screen.getByRole('img', { name: 'Central Park Court' });
    expect(image).toHaveAttribute('src', 'https://mock-storage/https://example.com/court.jpg');
  });

  it('renders placeholder image when no profile images', () => {
    const hoopWithoutImages = { ...mockHoop, images: [] };
    render(<Hoop hoop={hoopWithoutImages} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/400x300');
  });

  it('renders outdoor badge for outdoor court', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('renders indoor badge for indoor court', () => {
    const indoorHoop = { ...mockHoop, isIndoor: true };
    render(<Hoop hoop={indoorHoop} />);
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders condition badge', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  // Date badge is currently commented out in the Hoop page
  it.skip('renders date badge with formatted date', () => {
    render(<Hoop hoop={mockHoop} />);
    const dateBadge = screen.getByText(/Jan 10, 2024|10.*Jan.*2024/);
    expect(dateBadge).toBeInTheDocument();
  });

  it('renders PlayersPanel component', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText("Who's Playing")).toBeInTheDocument();
  });

  it('renders EnrollmentForm component', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText('Enroll to play')).toBeInTheDocument();
  });

  it('shows "Hoop not found" when hoop is undefined', () => {
    render(<Hoop hoop={undefined} />);
    expect(screen.getByText('Hoop not found')).toBeInTheDocument();
  });

  it('renders back arrow', () => {
    render(<Hoop hoop={mockHoop} />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Hoop hoop={mockHoop} />);
    expect(screen.getByText(/WhereHoops/)).toBeInTheDocument();
  });

  it('displays favorite icon', () => {
    render(<Hoop hoop={mockHoop} />);
    const favoriteIcon = document.querySelector('.hover\\:text-red-500');
    expect(favoriteIcon).toBeInTheDocument();
  });

  it('shows players from enrollments in PlayersPanel', async () => {
    vi.useRealTimers();
    const now = Date.now();
    vi.mocked(fetchHoopEnrollments).mockResolvedValueOnce([
      {
        id: 'enroll-1',
        playerId: 'user-alice',
        playerNickname: 'Alice',
        hoopId: 'test-hoop-1',
        arrivalTime: new Date(now - 10 * 60000),
        duration: 60,
        expired: false,
        playMode: 'open',
        createdAt: new Date(now - 15 * 60000),
      },
      {
        id: 'enroll-2',
        playerId: 'user-bob',
        playerNickname: 'Bob',
        hoopId: 'test-hoop-1',
        arrivalTime: new Date(now + 20 * 60000),
        duration: 90,
        expired: false,
        playMode: 'solo',
        createdAt: new Date(now - 5 * 60000),
      },
    ]);
    render(<Hoop hoop={mockHoop} />);
    await waitFor(() => {
      expect(screen.getByText('Playing Now (1)')).toBeInTheDocument();
    });
    expect(screen.getByText('Coming Soon (1)')).toBeInTheDocument();
  });

  it('renders different condition badges correctly', () => {
    const conditions = ['excellent', 'good', 'fair', 'poor'] as const;

    for (const condition of conditions) {
      const hoopWithCondition = { ...mockHoop, condition };
      const { unmount } = render(<Hoop hoop={hoopWithCondition} />);

      const expectedText = condition.charAt(0).toUpperCase() + condition.slice(1);
      expect(screen.getByText(expectedText)).toBeInTheDocument();

      unmount();
    }
  });
});
