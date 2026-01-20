import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { BackArrow } from '../../components/reusable/BackArrow';

describe('BackArrow', () => {
  it('renders back button', () => {
    render(<BackArrow />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<BackArrow />);
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('renders arrow icon', () => {
    const { container } = render(<BackArrow />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('button is clickable', async () => {
    const user = userEvent.setup();
    render(<BackArrow />);

    const button = screen.getByRole('button', { name: 'Go back' });

    // Should not throw when clicked
    await user.click(button);

    // Button should still be in the document after click
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('has fixed positioning class', () => {
    render(<BackArrow />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('fixed');
  });
});
