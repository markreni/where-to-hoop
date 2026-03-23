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
    enrollments: [],
  };

  it('renders the title', () => {
    render(<EnrollmentForm {...defaultProps} />);
    expect(screen.getByText('Enroll to play')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: /send enrollment/i })).toBeInTheDocument();
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

    const enrollButton = screen.getByRole('button', { name: /send enrollment/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText(/You're all set/)).toBeInTheDocument();
    });
  });

  it('shows cancel button after enrollment', async () => {
    vi.useRealTimers(); // Use real timers for user interaction
    const user = userEvent.setup();
    render(<EnrollmentForm {...defaultProps} />);

    const enrollButton = screen.getByRole('button', { name: /send enrollment/i });
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
    const enrollButton = screen.getByRole('button', { name: /send enrollment/i });
    await user.click(enrollButton);

    // Wait for the cancel button to appear and click it
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send enrollment/i })).toBeInTheDocument();
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

  describe('arrival slider max depends on time of day', () => {
    const getArrivalSlider = () => screen.getAllByRole('slider')[0];

    it('sets max to 720 at noon (capped at 12h)', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
      render(<EnrollmentForm {...defaultProps} />);
      expect(getArrivalSlider()).toHaveAttribute('max', '720');
    });

    it('sets max to 360 at 18:00 (6h remaining)', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 18, 0, 0));
      render(<EnrollmentForm {...defaultProps} />);
      expect(getArrivalSlider()).toHaveAttribute('max', '360');
    });

    it('rounds max down to nearest 30 min', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 18, 23, 0)); // 5h 37min left → 330
      render(<EnrollmentForm {...defaultProps} />);
      expect(getArrivalSlider()).toHaveAttribute('max', '330');
    });

    it('sets max to 30 at 23:30', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 23, 30, 0));
      render(<EnrollmentForm {...defaultProps} />);
      expect(getArrivalSlider()).toHaveAttribute('max', '30');
    });

    it('caps max at 720 when more than 12h remain', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 8, 0, 0)); // 16h remaining
      render(<EnrollmentForm {...defaultProps} />);
      expect(getArrivalSlider()).toHaveAttribute('max', '720');
    });

    it('shows the dynamic max in the slider end label', () => {
      vi.setSystemTime(new Date(2024, 0, 15, 18, 0, 0)); // 6h remaining
      render(<EnrollmentForm {...defaultProps} />);
      // Navigate from the slider to its range label div and check the right-end span
      const slider = getArrivalSlider();
      const endLabel = slider.nextElementSibling?.querySelector('span:last-child');
      expect(endLabel?.textContent).toMatch(/6\s*h/);
    });
  });

  describe('Today/Later toggle', () => {
    // Helper to get the mode toggle buttons by their exact text
    const getTodayToggle = () => screen.getByRole('button', { name: /^today$/i });
    const getLaterToggle = () => screen.getByRole('button', { name: /^later$/i });

    it('renders Today and Later toggle buttons', () => {
      render(<EnrollmentForm {...defaultProps} />);
      expect(getTodayToggle()).toBeInTheDocument();
      expect(getLaterToggle()).toBeInTheDocument();
    });

    it('defaults to Today mode', () => {
      render(<EnrollmentForm {...defaultProps} />);
      const todayButton = getTodayToggle();
      // Today button should have the active styling (first-color in class)
      expect(todayButton.className).toContain('text-first-color');
    });

    it('shows arrival time slider in Today mode', () => {
      render(<EnrollmentForm {...defaultProps} />);
      expect(screen.getByText(/I'll arrive in/)).toBeInTheDocument();
      // There are multiple "Now" texts (label and slider range), just check slider exists
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(1);
    });

    it('switches to Later mode when Later button is clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      const laterButton = getLaterToggle();
      await user.click(laterButton);

      // Later button should now be active
      expect(laterButton.className).toContain('text-first-color');
    });

    it('hides arrival slider and shows calendar in Later mode', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      const laterButton = getLaterToggle();
      await user.click(laterButton);

      // Arrival slider should be hidden
      expect(screen.queryByText(/I'll arrive in/)).not.toBeInTheDocument();
      // Calendar should be visible (check for calendar grid)
      expect(screen.getByRole('grid')).toBeInTheDocument();
      // Time slot label should be visible
      expect(screen.getByText(/Select time/i)).toBeInTheDocument();
    });

    it('shows time slot options in Later mode', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      const laterButton = getLaterToggle();
      await user.click(laterButton);

      // All time slots should be visible
      expect(screen.getByRole('button', { name: /morning/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /afternoon/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /evening/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /night/i })).toBeInTheDocument();
    });

    it('disables enroll button in Later mode until date and time slot selected', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      const laterButton = getLaterToggle();
      await user.click(laterButton);

      const enrollButton = screen.getByRole('button', { name: /send enrollment/i });
      // Button should be disabled (has bg-gray-400 class or isDisabled)
      expect(enrollButton.className).toContain('bg-gray-400');
    });

    it('switches back to Today mode when Today button is clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      // Switch to Later
      const laterButton = getLaterToggle();
      await user.click(laterButton);

      // Switch back to Today
      const todayButton = getTodayToggle();
      await user.click(todayButton);

      // Arrival slider should be visible again
      expect(screen.getByText(/I'll arrive in/)).toBeInTheDocument();
    });

    it('shows duration slider in Today mode but not in Later mode', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      // Duration visible in Today mode
      expect(screen.getByText(/I'll play for/)).toBeInTheDocument();

      // Switch to Later
      const laterButton = getLaterToggle();
      await user.click(laterButton);

      // Duration slider is not shown in Later mode
      expect(screen.queryByText(/I'll play for/)).not.toBeInTheDocument();
    });

    it('allows selecting a time slot in Later mode', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<EnrollmentForm {...defaultProps} />);

      const laterButton = getLaterToggle();
      await user.click(laterButton);

      const morningButton = screen.getByRole('button', { name: /morning/i });
      await user.click(morningButton);

      // Morning button should now be active
      expect(morningButton.className).toContain('border-first-color');
    });
  });
});
