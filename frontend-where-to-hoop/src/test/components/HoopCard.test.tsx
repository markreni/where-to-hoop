import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { HoopCard } from '../../components/reusable/HoopCard';
import type { BasketballHoop, PlayerEnrollment } from '../../types/types';
import { supabaseMockInstance, MOCK_USER } from '../services/supabaseMock';

const mockHoop: BasketballHoop = {
  id: '11',
  name: 'Central Park Court',
  createdAt: '2024-01-15T10:00:00Z',
  images: [{ id: 1, imagePath: 'https://example.com/court.jpg', addedDate: '2024-01-15' }],
  coordinates: { latitude: 60.1699, longitude: 24.9384 },
  description: { fi: '', en: 'Great outdoor court with good lighting' },
  condition: 'excellent',
  isIndoor: false,
  isPaid: false,
  isVerified: false,
  addedBy: 'test@example.com',
};

const mockIndoorHoop: BasketballHoop = {
  ...mockHoop,
  name: 'Indoor Gym Court',
  isIndoor: true,
  condition: 'good',
};

const mockEnrollments: PlayerEnrollment[] = [
  { id: 'e1', playerId: 'user-alice', playerNickname: 'Alice', hoopId: '11', arrivalTime: new Date(), duration: 60, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e2', playerId: 'user-bob', playerNickname: 'Bob', hoopId: '11', arrivalTime: new Date(), duration: 30, expired: false, playMode: 'solo', createdAt: new Date() },
  { id: 'e3', playerId: 'user-charlie', playerNickname: 'Charlie', hoopId: '11', arrivalTime: new Date(), duration: 45, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e4', playerId: 'user-david', playerNickname: 'David', hoopId: '11', arrivalTime: new Date(), duration: 90, expired: false, playMode: 'open', createdAt: new Date() },
  { id: 'e5', playerId: 'user-eve', playerNickname: 'Eve', hoopId: '11', arrivalTime: new Date(), duration: 120, expired: false, playMode: 'solo', createdAt: new Date() },
];

describe('HoopCard', () => {
  const defaultProps = {
    hoop: mockHoop,
    distance: 2.5,
    playerEnrollments: mockEnrollments,
  };

  beforeEach(() => {
    localStorage.clear();
    supabaseMockInstance.setSession({ user: MOCK_USER });
  });

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
    const descriptions = screen.getAllByText('Great outdoor court with good lighting');
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('renders hoop image with correct alt text', () => {
    render(<HoopCard {...defaultProps} />);
    const image = screen.getByRole('img', { name: 'Central Park Court' });
    expect(image).toHaveAttribute('src', 'https://mock-storage/https://example.com/court.jpg');
  });

  it('renders placeholder image when no profile images', () => {
    const hoopWithoutImages = { ...mockHoop, images: [] };
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
    expect(screen.getByText(/5 players on court/)).toBeInTheDocument();
  });

  it('caps players display at >99 for large numbers', () => {
    const manyEnrollments = Array.from({ length: 150 }, (_, i) => ({ id: `e${i}`, playerId: `user-${i}`, playerNickname: `Player${i}`, hoopId: '11', arrivalTime: new Date(), duration: 60, expired: false, playMode: 'open' as const, createdAt: new Date() }));
    render(<HoopCard {...defaultProps} playerEnrollments={manyEnrollments} />);
    expect(screen.getByText(/>99/)).toBeInTheDocument();
  });

  it('renders favorites icon', () => {
    render(<HoopCard {...defaultProps} />);
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
  });

  it('switches to map view when "On map" button is clicked', async () => {
    const user = userEvent.setup();
    render(<HoopCard {...defaultProps} />);

    const mapButton = screen.getByRole('button', { name: /map/i });
    await user.click(mapButton);

    expect(localStorage.getItem('mapView')).toBe('map');
  });

  it('renders "Ready to play" button', () => {
    render(<HoopCard {...defaultProps} />);
    const buttons = screen.getAllByRole('button', { name: /ready/i });
    expect(buttons.length).toBeGreaterThan(0);
  });
});
