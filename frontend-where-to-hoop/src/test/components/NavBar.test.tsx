import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import NavBar from '../../components/NavBar';

// Mock useMediaQuery
vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(() => true), // Default to desktop view
}));

// Mock useLocateUser
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}));

describe('NavBar', () => {
  it('renders logo with WhereHoops text', () => {
    render(<NavBar />);
    expect(screen.getByText('WhereHoops')).toBeInTheDocument();
  });

  it('renders Show Hoops button', () => {
    render(<NavBar />);
    expect(screen.getByText('Show Hoops')).toBeInTheDocument();
  });

  it('renders Add Hoop button', () => {
    render(<NavBar />);
    expect(screen.getByText('Add Hoop')).toBeInTheDocument();
  });

  it('logo links to home page', () => {
    render(<NavBar />);
    const logoLink = screen.getByText('WhereHoops').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('Show Hoops links to /hoops', () => {
    render(<NavBar />);
    const showHoopsLink = screen.getByText('Show Hoops').closest('a');
    expect(showHoopsLink).toHaveAttribute('href', '/hoops');
  });

  it('Add Hoop links to /addhoop', () => {
    render(<NavBar />);
    const addHoopLink = screen.getByText('Add Hoop').closest('a');
    expect(addHoopLink).toHaveAttribute('href', '/addhoop');
  });

  it('renders color mode toggle', () => {
    render(<NavBar />);
    // ColorModeToggle renders a button with a basketball icon
    const toggleButtons = screen.getAllByRole('button');
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it('renders language toggle', () => {
    render(<NavBar />);
    // LanguageToggle shows EN or FI
    expect(screen.getByText(/^(EN|FI)$/)).toBeInTheDocument();
  });
});
