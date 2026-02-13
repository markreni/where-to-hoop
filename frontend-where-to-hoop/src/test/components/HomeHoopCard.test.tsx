import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { HomeHoopCard } from '../../components/reusable/HomeHoopCard';
import type { BasketballHoop, Player } from '../../types/types';

const mockPlayer = (firstName: string): Player => ({
  id: `player-${firstName.toLowerCase()}`,
  firstName,
  lastName: '',
  nickname: '',
  email: `${firstName.toLowerCase()}@test.com`,
  favoriteHoops: [],
});

const mockHoop: BasketballHoop = {
  id: '1',
  name: 'Test Court',
  createdAt: '2024-01-15T10:00:00Z',
  profile_images: [{ id: 1, imageName: 'https://example.com/court.jpg', addedDate: '2024-01-15' }],
  coordinates: { latitude: 60.1699, longitude: 24.9384 },
  description: 'Great outdoor court',
  condition: 'excellent',
  isIndoor: false,
  playerEnrollments: [
    { id: 'e1', player: mockPlayer('Alice'), hoopId: '1', arrivalTime: new Date(), duration: 60, playMode: 'open', createdAt: new Date() },
    { id: 'e2', player: mockPlayer('Bob'), hoopId: '1', arrivalTime: new Date(), duration: 30, playMode: 'solo', createdAt: new Date() },
    { id: 'e3', player: mockPlayer('Charlie'), hoopId: '1', arrivalTime: new Date(), duration: 45, playMode: 'open', createdAt: new Date() },
    { id: 'e4', player: mockPlayer('David'), hoopId: '1', arrivalTime: new Date(), duration: 90, playMode: 'open', createdAt: new Date() },
    { id: 'e5', player: mockPlayer('Eve'), hoopId: '1', arrivalTime: new Date(), duration: 120, playMode: 'solo', createdAt: new Date() },
  ],
};

describe('HomeHoopCard', () => {
  const defaultProps = {
    hoop: mockHoop,
    distance: 2.5,
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
    expect(image).toHaveAttribute('src', 'https://example.com/court.jpg');
  });

  it('renders placeholder image when no profile images', () => {
    const hoopWithoutImages = { ...mockHoop, profile_images: [] };
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
    // Players badge now shows translated text with count
    expect(screen.getByText(/5 players on court/)).toBeInTheDocument();
  });

  it('caps players display at >99 for large numbers', () => {
    const hoopWithManyPlayers = { ...mockHoop, playerEnrollments: Array.from({ length: 150 }, (_, i) => ({ id: `e${i}`, player: mockPlayer(`Player${i}`), hoopId: '1', arrivalTime: new Date(), duration: 60, playMode: 'open' as const, createdAt: new Date() })) };
    render(<HomeHoopCard {...defaultProps} hoop={hoopWithManyPlayers} />);
    // Players badge now shows translated text with count
    expect(screen.getByText(/>99 players on court/)).toBeInTheDocument();
  });

  it('renders Ready to play button', () => {
    render(<HomeHoopCard {...defaultProps} />);
    const buttons = screen.getAllByRole('button', { name: /ready/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  /*
  it('logs message when Ready to play is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<HomeHoopCard {...defaultProps} />);

    const readyButton = screen.getByRole('button', { name: /ready/i });
    await user.click(readyButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ready to play at hoop Test Court')
    );

    consoleSpy.mockRestore();
  });
  */
});
