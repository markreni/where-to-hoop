import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import Hoops from '../../pages/Hoops';

// Mock Map component (uses Leaflet)
vi.mock('../../components/Map', () => ({
  Map: () => <div data-testid="map-component">Map View</div>,
}));

// Mock useLocateUser hook
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}));

describe('Hoops', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Create a fresh localStorage mock for each test
    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  it('renders list toggle button', () => {
    render(<Hoops />);
    expect(screen.getByRole('button', { name: /Show List|Show Map/i })).toBeInTheDocument();
  });

  it('defaults to map view', () => {
    render(<Hoops />);
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
    expect(screen.getByText('Show List')).toBeInTheDocument();
  });

  it('toggles to list view when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    // Should now show list view with hoop cards
    expect(screen.queryByTestId('map-component')).not.toBeInTheDocument();
    expect(screen.getByText('Show Map')).toBeInTheDocument();
  });

  it('toggles back to map view', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    // Now in list view
    expect(screen.getByText('Show Map')).toBeInTheDocument();

    // Toggle back
    const mapToggleButton = screen.getByRole('button', { name: /Show Map/i });
    await user.click(mapToggleButton);

    expect(screen.getByTestId('map-component')).toBeInTheDocument();
    expect(screen.getByText('Show List')).toBeInTheDocument();
  });

  it('persists map view preference to localStorage', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    // Toggle to list view
    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    expect(window.localStorage.setItem).toHaveBeenCalledWith('hoopsMapView', 'false');
  });

  it('renders filter labels in map view', () => {
    render(<Hoops />);
    expect(screen.getByText('Door Type')).toBeInTheDocument();
    expect(screen.getByText('Court Condition')).toBeInTheDocument();
  });

  it('renders condition filter options in map view', () => {
    render(<Hoops />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('renders door type filter options in map view', () => {
    render(<Hoops />);
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('shows hoop cards in list view', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    // Toggle to list view
    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    // Should show mock hoop names
    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
    expect(screen.getByText('Downtown Center')).toBeInTheDocument();
    expect(screen.getByText('Riverside Court')).toBeInTheDocument();
  });

  it('renders search field in list view', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    // Toggle to list view
    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    expect(screen.getByPlaceholderText('Find hoops')).toBeInTheDocument();
  });

  it('renders filter button in list view', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    // Toggle to list view
    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: 'Filter hoops' })).toBeInTheDocument();
  });

  it('filters hoops by search in list view', async () => {
    const user = userEvent.setup();
    render(<Hoops />);

    // Toggle to list view
    const toggleButton = screen.getByRole('button', { name: /Show List/i });
    await user.click(toggleButton);

    // Type in search
    const searchInput = screen.getByPlaceholderText('Find hoops');
    await user.type(searchInput, 'Central');

    // Only Central Park Court should be visible
    expect(screen.getByText('Central Park Court')).toBeInTheDocument();
    expect(screen.queryByText('Downtown Center')).not.toBeInTheDocument();
    expect(screen.queryByText('Riverside Court')).not.toBeInTheDocument();
  });
});
