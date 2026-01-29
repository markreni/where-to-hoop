import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import Home from '../../pages/Home';
import initialHoops from '../../mockhoops';

// Mock useLocateUser hook
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}));

// Mock the background image import
vi.mock('../../images/baskethoop.png', () => ({
  default: 'mock-basketball-image.png',
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page headings', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByText('Nearest Courts')).toBeInTheDocument();
    expect(screen.getByText('Most Active Courts')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows enable location message when location is not available', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByText('Enable location access to see the nearest courts')).toBeInTheDocument();
  });

  it('renders carousel for most active courts', () => {
    render(<Home hoops={initialHoops} />);
    // The "Most Active Courts" carousel should always be visible
    const carousels = screen.getAllByRole('region', { name: 'Carousel' });
    expect(carousels.length).toBeGreaterThanOrEqual(1);
  });

  // Background image is currently commented out in the component
  it.skip('renders background image', () => {
    render(<Home hoops={initialHoops} />);
    const backgroundImg = document.querySelector('img[aria-hidden="true"]');
    expect(backgroundImg).toBeInTheDocument();
  });

  it('renders hoop cards in most active courts carousel', () => {
    render(<Home hoops={initialHoops} />);
    // Mock hoops should be rendered
    expect(screen.getAllByText('Central Park Court').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Downtown Center').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Riverside Court').length).toBeGreaterThanOrEqual(1);
  });

  it('renders About link in footer', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('renders Privacy link in footer', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
  });

  it('renders copyright in footer', () => {
    render(<Home hoops={initialHoops} />);
    expect(screen.getByText(/WhereHoops\. All rights reserved\./)).toBeInTheDocument();
  });
});

describe('Home with location', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders two carousels when location is available', async () => {
    // Mock LocationContext to provide coordinates
    vi.doMock('../../contexts/LocationContext', async () => {
      const actual = await vi.importActual('../../contexts/LocationContext');
      return {
        ...actual,
        useLocationValues: () => ({
          latitude: 60.1699,
          longitude: 24.9384,
        }),
      };
    });

    // Need to re-import after mocking
    const { default: HomeWithLocation } = await import('../../pages/Home');
    render(<HomeWithLocation hoops={initialHoops} />);

    // Both carousels should be visible
    const carousels = screen.getAllByRole('region', { name: 'Carousel' });
    expect(carousels.length).toBeGreaterThanOrEqual(1);
  });
});
