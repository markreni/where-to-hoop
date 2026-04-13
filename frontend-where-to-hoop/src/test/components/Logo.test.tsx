import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Logo } from '../../components/reusable/Logo';

describe('Logo', () => {
  it('renders WhereH🏀🏀pz text', () => {
    render(<Logo />);
    expect(screen.getByRole('heading', { name: 'WhereH🏀🏀pz' })).toBeInTheDocument();
  });

  it('renders as a heading element', () => {
    render(<Logo />);
    expect(screen.getByRole('heading', { name: 'WhereH🏀🏀pz' })).toBeInTheDocument();
  });

  it('has correct heading level', () => {
    render(<Logo />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('WhereH🏀🏀pz');
  });

  it('applies styling classes', () => {
    render(<Logo />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-first-color');
    expect(heading).toHaveClass('font-semibold');
  });
});
