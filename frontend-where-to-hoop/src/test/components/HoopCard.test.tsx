import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { HoopCard } from '../../components/reusable/HoopCard';
import type { BasketballHoop } from '../../types/types';

const mockHoop: BasketballHoop = {
  id: '11',
  name: 'Central Park Court',
  createdAt: '2024-01-15T10:00:00Z',
  profile_images: [{ id: 1, imageName: 'https://example.com/court.jpg', addedDate: '2024-01-15' }],
  coordinates: { latitude: 60.1699, longitude: 24.9384 },
  description: 'Great outdoor court with good lighting',
  condition: 'excellent',
  isIndoor: false,
  playerEnrollments: [
    { id: 'e1', playerName: 'Alice', hoopId: '11', arrivalTime: new Date(), duration: 60, playMode: 'open', createdAt: new Date() },
    { id: 'e2', playerName: 'Bob', hoopId: '11', arrivalTime: new Date(), duration: 30, playMode: 'solo', createdAt: new Date() },
    { id: 'e3', playerName: 'Charlie', hoopId: '11', arrivalTime: new Date(), duration: 45, playMode: 'open', createdAt: new Date() },
    { id: 'e4', playerName: 'David', hoopId: '11', arrivalTime: new Date(), duration: 90, playMode: 'open', createdAt: new Date() },
    { id: 'e5', playerName: 'Eve', hoopId: '11', arrivalTime: new Date(), duration: 120, playMode: 'solo', createdAt: new Date() },
  ],
};

const mockIndoorHoop: BasketballHoop = {
  ...mockHoop,
  name: 'Indoor Gym Court',
  isIndoor: true,
  condition: 'good',
};

describe('HoopCard', () => {
  const defaultProps = {
    hoop: mockHoop,
    toggleFunction: vi.fn(),
    mapView: false,
    distance: 2.5,
  };

  it('renders hoop name', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
  });

  it('renders distance with one decimal place', () => {
    render(<HoopCard {...defaultProps} distance={3.456} />);
    expect(screen.getByText('3.5 km')).toBeInTheDocument();
  });

  it('renders hoop description', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByText('Great outdoor court with good lighting')).toBeInTheDocument();
  });

  it('renders hoop image with correct alt text', () => {
    render(<HoopCard {...defaultProps} />);
    const image = screen.getByRole('img', { name: 'Central Park Court' });
    expect(image).toHaveAttribute('src', 'https://example.com/court.jpg');
  });

  it('renders placeholder image when no profile images', () => {
    const hoopWithoutImages = { ...mockHoop, profile_images: [] };
    render(<HoopCard {...defaultProps} hoop={hoopWithoutImages} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/150');
  });

  it('renders outdoor badge for outdoor court', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('renders indoor badge for indoor court', () => {
    render(<HoopCard {...defaultProps} hoop={mockIndoorHoop} />);
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders condition badge', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders players count', () => {
    render(<HoopCard {...defaultProps} />);
    // Find the players badge container and check it contains the count
    const playersBadge = screen.getByText('5').closest('.hoop-card-icon');
    expect(playersBadge).toHaveClass('bg-purple-100');
  });

  it('caps players display at >99 for large numbers', () => {
    const hoopWithManyPlayers = { ...mockHoop, playerEnrollments: Array.from({ length: 150 }, (_, i) => ({ id: `e${i}`, playerName: `Player${i}`, hoopId: '11', arrivalTime: new Date(), duration: 60, createdAt: new Date() })) };
    render(<HoopCard {...defaultProps} hoop={hoopWithManyPlayers} />);
    expect(screen.getByText(/>99/)).toBeInTheDocument();
  });

  it('renders favorites icon', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
  });

  it('calls toggleFunction when "On map" button is clicked', async () => {
    const user = userEvent.setup();
    const toggleFunction = vi.fn();

    render(<HoopCard {...defaultProps} toggleFunction={toggleFunction} mapView={false} />);

    const mapButton = screen.getByRole('button', { name: /map/i });
    await user.click(mapButton);

    expect(toggleFunction).toHaveBeenCalledWith(true);
  });

  it('renders "Ready to play" button', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /ready/i })).toBeInTheDocument();
  });

  /*
  it('logs message when "Ready to play" is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<HoopCard {...defaultProps} />);

    const readyButton = screen.getByRole('button', { name: /ready/i });
    await user.click(readyButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ready to play at hoop Central Park Court')
    );

    consoleSpy.mockRestore();
  });
  */
});
