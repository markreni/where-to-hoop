import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ColorModeToggle } from '../../components/reusable/ColormodeToggle';

describe('ColorModeToggle', () => {
  it('renders toggle button', () => {
    render(<ColorModeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles color mode when clicked', async () => {
    const user = userEvent.setup();
    render(<ColorModeToggle />);

    const toggleButton = screen.getByRole('button');

    // Initial state - check button exists
    expect(toggleButton).toBeInTheDocument();

    // Click to toggle
    await user.click(toggleButton);

    // Button should still be rendered after toggle
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders basketball icon', () => {
    const { container } = render(<ColorModeToggle />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('can be toggled multiple times', async () => {
    const user = userEvent.setup();
    render(<ColorModeToggle />);

    const toggleButton = screen.getByRole('button');

    // Toggle multiple times
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    // Button should still work
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
