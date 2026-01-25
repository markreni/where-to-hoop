import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { EnrollmentForm } from '../../components/EnrollmentForm';

describe('EnrollmentForm', () => {
  const fixedNow = new Date('2024-01-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    hoopId: 'test-hoop-1',
  };

  it('renders the title', () => {
    render(<EnrollmentForm {...defaultProps} />);
    expect(screen.getByText('Join the Game')).toBeInTheDocument();
  });

  it('renders arrival time slider', () => {
    render(<EnrollmentForm {...defaultProps} />);
    expect(screen.getByText(/I'll arrive in/)).toBeInTheDocument();
  });

  it('renders duration slider', () => {
    render(<EnrollmentForm {...defaultProps} />);
    expect(screen.getByText(/I'll play for/)).toBeInTheDocument();
  });

  it('renders enroll button', () => {
    render(<EnrollmentForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /let them know/i })).toBeInTheDocument();
  });

  it('shows "Now" for arrival time when slider is at 0', () => {
    render(<EnrollmentForm {...defaultProps} />);
    // Default arrival is 0, should show "Now"
    const arrivalLabel = screen.getByText(/I'll arrive in/);
    expect(arrivalLabel.textContent).toContain('Now');
  });

  it('shows default duration of 1 hour', () => {
    render(<EnrollmentForm {...defaultProps} />);
    const durationLabel = screen.getByText(/I'll play for/);
    // Format is "1 h" (with space between number and unit)
    expect(durationLabel.textContent).toMatch(/1\s*h/);
  });

  it('updates arrival time display when slider changes', () => {
    render(<EnrollmentForm {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    const arrivalSlider = sliders[0];

    fireEvent.change(arrivalSlider, { target: { value: '60' } });

    const arrivalLabel = screen.getByText(/I'll arrive in/);
    expect(arrivalLabel.textContent).toMatch(/1\s*h/);
  });

  it('updates duration display when slider changes', () => {
    render(<EnrollmentForm {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    const durationSlider = sliders[1];

    fireEvent.change(durationSlider, { target: { value: '120' } });

    const durationLabel = screen.getByText(/I'll play for/);
    expect(durationLabel.textContent).toMatch(/2\s*h/);
  });

  it('shows success message after enrollment', async () => {
    vi.useRealTimers(); // Use real timers for user interaction
    const user = userEvent.setup();
    render(<EnrollmentForm {...defaultProps} />);

    const enrollButton = screen.getByRole('button', { name: /let them know/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText(/You're all set/)).toBeInTheDocument();
    });
  });

  it('shows cancel button after enrollment', async () => {
    vi.useRealTimers(); // Use real timers for user interaction
    const user = userEvent.setup();
    render(<EnrollmentForm {...defaultProps} />);

    const enrollButton = screen.getByRole('button', { name: /let them know/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('returns to enrollment form when cancel is clicked', async () => {
    vi.useRealTimers(); // Use real timers for user interaction
    const user = userEvent.setup();
    render(<EnrollmentForm {...defaultProps} />);

    // Enroll first
    const enrollButton = screen.getByRole('button', { name: /let them know/i });
    await user.click(enrollButton);

    // Wait for the cancel button to appear and click it
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /let them know/i })).toBeInTheDocument();
    });
  });

  it('displays clock icon', () => {
    render(<EnrollmentForm {...defaultProps} />);
    // FaClock should be present in the header
    const clockIcon = document.querySelector('.text-first-color');
    expect(clockIcon).toBeInTheDocument();
  });

  it('shows 30 min duration when slider is at minimum', () => {
    render(<EnrollmentForm {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    const durationSlider = sliders[1];

    fireEvent.change(durationSlider, { target: { value: '30' } });

    const durationLabel = screen.getByText(/I'll play for/);
    expect(durationLabel.textContent).toContain('30');
    expect(durationLabel.textContent).toContain('min');
  });

  it('shows mixed hours and minutes format', () => {
    render(<EnrollmentForm {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    const durationSlider = sliders[1];

    fireEvent.change(durationSlider, { target: { value: '90' } });

    const durationLabel = screen.getByText(/I'll play for/);
    expect(durationLabel.textContent).toMatch(/1\s*h/);
    expect(durationLabel.textContent).toContain('30');
  });
});
