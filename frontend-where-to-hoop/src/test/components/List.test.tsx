import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { List } from '../../components/List';
import type { BasketballHoop, Condition } from '../../types/types';

// Mock useMediaQuery
vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(() => false), // Default to mobile view
}));

// Mock useLocateUser
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}));

const mockHoops: { hoop: BasketballHoop; distance: number }[] = [
  {
    hoop: {
      id: '1',
      name: 'Central Park Court',
      createdAt: '2024-01-15T10:00:00Z',
      profile_images: [{ id: 1, imageName: 'https://example.com/court1.jpg', addedDate: '2024-01-15' }],
      coordinates: { latitude: 60.1699, longitude: 24.9384 },
      description: 'Great outdoor court',
      condition: 'excellent',
      isIndoor: false,
      currentPlayers: 5,
    },
    distance: 1.2,
  },
  {
    hoop: {
      id: '2',
      name: 'Indoor Gym',
      createdAt: '2024-01-15T10:00:00Z',
      profile_images: [{ id: 2, imageName: 'https://example.com/court2.jpg', addedDate: '2024-01-15' }],
      coordinates: { latitude: 60.1700, longitude: 24.9400 },
      description: 'Indoor basketball court',
      condition: 'good',
      isIndoor: true,
      currentPlayers: 3,
    },
    distance: 2.5,
  },
];

const defaultFilters = {
  selectedConditions: new Set<Condition>(['excellent', 'good', 'fair', 'poor']),
  selectedDoors: new Set<'indoor' | 'outdoor'>(['indoor', 'outdoor']),
  onToggleCondition: vi.fn(),
  onToggleDoor: vi.fn(),
  clearConditionFilters: vi.fn(),
  clearDoorFilters: vi.fn(),
};

describe('List', () => {
  const defaultProps = {
    filteredAndSortedHoops: mockHoops,
    toggleFunction: vi.fn(),
    mapView: false,
    filters: defaultFilters,
  };

  it('renders hoop cards', () => {
    render(<List {...defaultProps} />);
    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
    expect(screen.getByText('Indoor Gym')).toBeInTheDocument();
  });

  it('renders search field', () => {
    render(<List {...defaultProps} />);
    expect(screen.getByPlaceholderText('Find hoops')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(<List {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Filter hoops' })).toBeInTheDocument();
  });

  it('filters hoops by search term', async () => {
    const user = userEvent.setup();
    render(<List {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Find hoops');
    await user.type(searchInput, 'Central');

    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
    expect(screen.queryByText('Indoor Gym')).not.toBeInTheDocument();
  });

  it('shows all hoops when search is cleared', async () => {
    const user = userEvent.setup();
    render(<List {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Find hoops');
    await user.type(searchInput, 'Central');
    await user.clear(searchInput);

    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
    expect(screen.getByText('Indoor Gym')).toBeInTheDocument();
  });

  it('search is case insensitive', async () => {
    const user = userEvent.setup();
    render(<List {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Find hoops');
    await user.type(searchInput, 'central');

    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
  });

  it('toggles filter panel when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<List {...defaultProps} />);

    const filterButton = screen.getByRole('button', { name: 'Filter hoops' });

    // Initially filters are not shown
    expect(filterButton).toHaveAttribute('aria-pressed', 'false');

    // Click to show filters
    await user.click(filterButton);
    expect(filterButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows empty list when no hoops match search', async () => {
    const user = userEvent.setup();
    render(<List {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Find hoops');
    await user.type(searchInput, 'nonexistent');

    expect(screen.queryByText('Central Park Court')).not.toBeInTheDocument();
    expect(screen.queryByText('Indoor Gym')).not.toBeInTheDocument();
  });
});
