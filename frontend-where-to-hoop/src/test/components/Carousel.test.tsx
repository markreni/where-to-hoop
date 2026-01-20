import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Carousel } from '../../components/reusable/Carousel';

describe('Carousel', () => {
  const slides = [
    <div key="1">Slide 1</div>,
    <div key="2">Slide 2</div>,
    <div key="3">Slide 3</div>,
  ];

  it('renders carousel region', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
  });

  it('renders all slides', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('renders navigation dots for multiple slides', () => {
    render(<Carousel>{slides}</Carousel>);
    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(3);
  });

  it('first dot is selected by default', () => {
    render(<Carousel>{slides}</Carousel>);
    const dots = screen.getAllByRole('tab');
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    expect(dots[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('renders previous slide button', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getAllByRole('button', { name: 'Previous slide' }).length).toBeGreaterThan(0);
  });

  it('renders next slide button', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getAllByRole('button', { name: 'Next slide' }).length).toBeGreaterThan(0);
  });

  it('previous button is disabled on first slide', () => {
    render(<Carousel>{slides}</Carousel>);
    const prevButtons = screen.getAllByRole('button', { name: 'Previous slide' });
    prevButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('navigates to next slide when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<Carousel>{slides}</Carousel>);

    // Get the mobile next button (first one in the array that's not hidden)
    const nextButtons = screen.getAllByRole('button', { name: 'Next slide' });
    await user.click(nextButtons[0]);

    // Second dot should now be selected
    const dots = screen.getAllByRole('tab');
    expect(dots[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to specific slide when dot is clicked', async () => {
    const user = userEvent.setup();
    render(<Carousel>{slides}</Carousel>);

    const dots = screen.getAllByRole('tab');
    await user.click(dots[2]); // Click third dot

    expect(dots[2]).toHaveAttribute('aria-selected', 'true');
    expect(dots[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('does not render navigation when only one slide', () => {
    render(<Carousel>{[<div key="1">Only Slide</div>]}</Carousel>);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument();
  });

  it('slides have correct aria labels', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '2 of 3' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '3 of 3' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Carousel className="custom-class">{slides}</Carousel>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
