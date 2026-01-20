import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

// Test component that exposes toast context methods
const TestComponent = () => {
  const { toasts, addToast, removeToast, clearToasts, success, error, info, warning } = useToast();

  return (
    <div>
      <span data-testid="toast-count">{toasts.length}</span>
      <button onClick={() => addToast('success', 'Test toast', 0)}>Add Toast</button>
      <button onClick={() => addToast('success', 'Auto dismiss', 100)}>Auto Dismiss</button>
      <button onClick={() => success('Success!', 0)}>Success</button>
      <button onClick={() => error('Error!', 0)}>Error</button>
      <button onClick={() => info('Info!', 0)}>Info</button>
      <button onClick={() => warning('Warning!', 0)}>Warning</button>
      <button onClick={() => clearToasts()}>Clear All</button>
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          <span>{toast.message}</span>
          <span>{toast.type}</span>
          <button onClick={() => removeToast(toast.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

describe('ToastContext', () => {
  it('provides empty toasts array by default', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('adds toast with addToast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText('Test toast')).toBeInTheDocument();
  });

  it('adds success toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Success'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('adds error toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Error'));

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('adds info toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Info'));

    expect(screen.getByText('Info!')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('adds warning toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Warning'));

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('removes specific toast with removeToast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByText('Test toast')).toBeInTheDocument();

    await user.click(screen.getByText('Remove'));
    expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
  });

  it('clears all toasts with clearToasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Success'));
    await user.click(screen.getByText('Error'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');

    await user.click(screen.getByText('Clear All'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('auto-dismisses toast after duration', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Auto Dismiss'));
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    // Wait for auto-dismiss (100ms + buffer)
    await waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('can add multiple toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Success'));
    await user.click(screen.getByText('Error'));
    await user.click(screen.getByText('Warning'));

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ComponentOutsideProvider = () => {
      useToast();
      return null;
    };

    expect(() => render(<ComponentOutsideProvider />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleError.mockRestore();
  });

  it('each toast has unique id', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Success'));
    await user.click(screen.getByText('Error'));

    const toasts = screen.getAllByTestId(/^toast-/);
    const ids = toasts.map(t => t.getAttribute('data-testid'));
    const uniqueIds = new Set(ids);

    // All IDs should be unique (set size equals array length)
    expect(uniqueIds.size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });
});
