import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoopBadge } from '../../components/reusable/HoopBadge';

describe('HoopBadge', () => {
  it('renders text correctly', () => {
    render(<HoopBadge variant="indoor" text="Indoor Court" />);
    expect(screen.getByText('Indoor Court')).toBeInTheDocument();
  });

  it('renders indoor variant with correct styling', () => {
    const { container } = render(<HoopBadge variant="indoor" text="Indoor" />);
    const badge = container.querySelector('.hoop-card-icon');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('renders outdoor variant with correct styling', () => {
    const { container } = render(<HoopBadge variant="outdoor" text="Outdoor" />);
    const badge = container.querySelector('.hoop-card-icon');
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-700');
  });

  it('renders date variant with correct styling', () => {
    const { container } = render(<HoopBadge variant="date" text="01/15/24" />);
    const badge = container.querySelector('.hoop-card-icon');
    expect(badge).toHaveClass('bg-gray-200', 'text-gray-800');
  });

  it('renders players variant with correct styling', () => {
    const { container } = render(<HoopBadge variant="players" text="5 players" />);
    const badge = container.querySelector('.hoop-card-icon');
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
  });

  it('renders condition variant with condition class', () => {
    const { container } = render(
      <HoopBadge variant="condition" condition="excellent" text="Excellent" />
    );
    const badge = container.querySelector('.hoop-card-icon');
    expect(badge).toHaveClass('hoop-icon--excellent');
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(
      <HoopBadge variant="indoor" text="Indoor" showIcon={false} />
    );
    // Icon should not be rendered
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('shows icon by default', () => {
    const { container } = render(<HoopBadge variant="indoor" text="Indoor" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom text className', () => {
    render(<HoopBadge variant="indoor" text="Indoor" textClassName="text-lg" />);
    const textSpan = screen.getByText('Indoor');
    expect(textSpan).toHaveClass('text-lg');
  });

  it('capitalizes text for condition variant', () => {
    render(<HoopBadge variant="condition" condition="good" text="good" />);
    const textSpan = screen.getByText('good');
    expect(textSpan).toHaveClass('capitalize');
  });
});
