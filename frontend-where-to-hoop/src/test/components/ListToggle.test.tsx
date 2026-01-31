import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ListToggle } from '../../components/ListToggle';

describe('ListToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders toggle button', () => {
    render(<ListToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows "Show List" text when mapView is map (default)', () => {
    render(<ListToggle />);
    expect(screen.getByText('Show List')).toBeInTheDocument();
  });

  it('toggles to list view when clicked', async () => {
    const user = userEvent.setup();
    render(<ListToggle />);

    // Initially shows "Show List" (because default is map view)
    expect(screen.getByText('Show List')).toBeInTheDocument();

    const button = screen.getByRole('button');
    await user.click(button);

    // After click, shows "Show Map" (because now in list view)
    expect(screen.getByText('Show Map')).toBeInTheDocument();
  });

  it('toggles back to map view when clicked twice', async () => {
    const user = userEvent.setup();
    render(<ListToggle />);

    const button = screen.getByRole('button');
    await user.click(button); // map -> list
    await user.click(button); // list -> map

    expect(screen.getByText('Show List')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(<ListToggle />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
