import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ListToggle } from '../../components/ListToggle';

describe('ListToggle', () => {
  const defaultProps = {
    toggleFunction: vi.fn(),
    mapView: false,
  };

  it('renders toggle button', () => {
    render(<ListToggle {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows "Show Map" text when mapView is false', () => {
    render(<ListToggle {...defaultProps} mapView={false} />);
    expect(screen.getByText('Show Map')).toBeInTheDocument();
  });

  it('shows "Show List" text when mapView is true', () => {
    render(<ListToggle {...defaultProps} mapView={true} />);
    expect(screen.getByText('Show List')).toBeInTheDocument();
  });

  it('calls toggleFunction with true when mapView is false and clicked', async () => {
    const user = userEvent.setup();
    const toggleFunction = vi.fn();

    render(<ListToggle toggleFunction={toggleFunction} mapView={false} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(toggleFunction).toHaveBeenCalledWith(true);
  });

  it('calls toggleFunction with false when mapView is true and clicked', async () => {
    const user = userEvent.setup();
    const toggleFunction = vi.fn();

    render(<ListToggle toggleFunction={toggleFunction} mapView={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(toggleFunction).toHaveBeenCalledWith(false);
  });

  it('renders icon', () => {
    const { container } = render(<ListToggle {...defaultProps} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
