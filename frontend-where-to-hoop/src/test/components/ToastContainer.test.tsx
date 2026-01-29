import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from '../../components/reusable/ToastContainer';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

// Helper component to trigger toasts
const ToastTrigger = () => {
  const { success, error, info, warning, clearToasts, addToast } = useToast();

  return (
    <div>
      <button onClick={() => success('Success message', 0)}>Show Success</button>
      <button onClick={() => error('Error message', 0)}>Show Error</button>
      <button onClick={() => info('Info message', 0)}>Show Info</button>
      <button onClick={() => warning('Warning message', 0)}>Show Warning</button>
      <button onClick={() => addToast('success', 'Auto dismiss', 100)}>Auto Dismiss</button>
      <button onClick={() => clearToasts()}>Clear All</button>
    </div>
  );
};

const renderWithToastProvider = () => {
  return render(
    <ToastProvider>
      <ToastTrigger />
      <ToastContainer />
    </ToastProvider>
  );
};

describe('ToastContainer', () => {
  it('does not render when no toasts', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders success toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Success'));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders error toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders info toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders warning toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('renders close button on toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Success'));

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('clears all toasts when clearToasts is called', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Success'));
    await user.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();

    await user.click(screen.getByText('Clear All'));

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('can show multiple toasts', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Show Success'));
    await user.click(screen.getByText('Show Error'));

    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('auto-dismisses toast after duration', async () => {
    const user = userEvent.setup();
    renderWithToastProvider();

    await user.click(screen.getByText('Auto Dismiss'));
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    // Wait for auto-dismiss (100ms + buffer)
    await waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});
