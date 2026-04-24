import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { HomeHoopCard } from '../../components/reusable/HomeHoopCard';
import type { BasketballHoop, PlayerEnrollment } from '../../types/types';

const mockHoop: BasketballHoop = {
  id: '1',
  name: 'Test Court',
  createdAt: '2024-01-15T10:00:00Z',
  images: [{ id: 1, imagePath: 'https://example.com/court.jpg', addedDate: '2024-01-15' }],
  coordinates: { latitude: 60.1699, longitude: 24.9384 },
  description: { fi: '', en: 'Great outdoor court' },
  condition: 'excellent',
  isIndoor: false,
  isPaid: false,
  isVerified: false,
  addedBy: 'test@example.com',
};

const mockEnrollments: PlayerEnrollment[] = [
  { id: 'e1', playerId: 'user-alice', playerNickname: 'Alice', hoopId: '1', arrivalTime: new Date(), duration: 60, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e2', playerId: 'user-bob', playerNickname: 'Bob', hoopId: '1', arrivalTime: new Date(), duration: 30, expired: false, playMode: 'solo', createdAt: new Date() },
  { id: 'e3', playerId: 'user-charlie', playerNickname: 'Charlie', hoopId: '1', arrivalTime: new Date(), duration: 45, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e4', playerId: 'user-david', playerNickname: 'David', hoopId: '1', arrivalTime: new Date(), duration: 90, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e5', playerId: 'user-eve', playerNickname: 'Eve', hoopId: '1', arrivalTime: new Date(), duration: 120, expired: false, playMode: 'solo', createdAt: new Date() },
];

describe('HomeHoopCard', () => {
  const defaultProps = {
    hoop: mockHoop,
    distance: 2.5,
    playerEnrollments: mockEnrollments,
  };

  it('renders hoop name', () => {
    render(<HomeHoopCard {...defaultProps} />);
    expect(screen.getByText('Test Court')).toBeInTheDocument();
  });

  it('renders distance with one decimal place', () => {
    render(<HomeHoopCard {...defaultProps} distance={3.456} />);
    expect(screen.getByText('3.5 km')).toBeInTheDocument();
  });

  it('renders hoop image with correct alt text', () => {
    render(<HomeHoopCard {...defaultProps} />);
    const image = screen.getByRole('img', { name: 'Test Court' });
    expect(image).toHaveAttribute('src', 'https://mock-storage/https://example.com/court.jpg');
  });

  it('renders placeholder image when no profile images', () => {
    const hoopWithoutImages = { ...mockHoop, images: [] };
    render(<HomeHoopCard {...defaultProps} hoop={hoopWithoutImages} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200');
  });

  it('renders outdoor badge for outdoor court', () => {
    render(<HomeHoopCard {...defaultProps} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('renders indoor badge for indoor court', () => {
    const indoorHoop = { ...mockHoop, isIndoor: true };
    render(<HomeHoopCard {...defaultProps} hoop={indoorHoop} />);
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders condition badge', () => {
    render(<HomeHoopCard {...defaultProps} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders players count', () => {
    render(<HomeHoopCard {...defaultProps} />);
    expect(screen.getByText(/5 players on court/)).toBeInTheDocument();
  });

  it('caps players display at >99 for large numbers', () => {
    const manyEnrollments = Array.from({ length: 150 }, (_, i) => ({ id: `e${i}`, playerId: `user-${i}`, playerNickname: `Player${i}`, hoopId: '1', arrivalTime: new Date(), duration: 60, expired: false, playMode: 'open' as const, createdAt: new Date() }));
    render(<HomeHoopCard {...defaultProps} playerEnrollments={manyEnrollments} />);
    expect(screen.getByText(/>99 players on court/)).toBeInTheDocument();
  });

  it("renders Let's hoopz button", () => {
    render(<HomeHoopCard {...defaultProps} />);
    const buttons = screen.getAllByRole('button', { name: /let's hoopz/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  /*
  it("logs message when Let's hoopz is clicked", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<HomeHoopCard {...defaultProps} />);

    const readyButton = screen.getByRole('button', { name: /ready/i });
    await user.click(readyButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Let's hoopz at hoop Test Court")
    );

    consoleSpy.mockRestore();
  });
  */
});
