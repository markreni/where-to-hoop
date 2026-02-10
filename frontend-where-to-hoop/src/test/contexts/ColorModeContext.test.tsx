import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ColorModeContextProvider,
  useColorModeValues,
  useColorModeDispatch,
} from '../../contexts/ColorModeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that displays and toggles color mode
const TestComponent = () => {
  const colorMode = useColorModeValues();
  const dispatch = useColorModeDispatch();

  return (
    <div>
      <span data-testid="color-mode">{colorMode}</span>
      <button onClick={() => dispatch(colorMode === 'light' ? 'dark' : 'light')}>
        Toggle
      </button>
    </div>
  );
};

describe('DarkModeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('provides default light mode when localStorage is empty', () => {
    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
  });

  it('reads initial state from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark');

    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
  });

  it('toggles color mode when dispatch is called', async () => {
    const user = userEvent.setup();

    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
  });

  it('persists color mode to localStorage on change', async () => {
    const user = userEvent.setup();

    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('colorMode', 'dark');
  });

  it('toggles back to light mode', async () => {
    const user = userEvent.setup();

    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    // Toggle to dark
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');

    // Toggle back to light
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
  });

  it('defaults to light mode for invalid localStorage value', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid');

    render(
      <ColorModeContextProvider>
        <TestComponent />
      </ColorModeContextProvider>
    );

    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
  });
});
