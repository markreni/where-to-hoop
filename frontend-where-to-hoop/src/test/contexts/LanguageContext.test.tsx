import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LanguageContextProvider,
  useLanguage,
  useSetLanguage,
} from '../../contexts/LanguageContext';

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

// Test component that displays and toggles language
const TestComponent = () => {
  const language = useLanguage();
  const setLanguage = useSetLanguage();

  return (
    <div>
      <span data-testid="language">{language}</span>
      <button onClick={() => setLanguage(language === 'en' ? 'fi' : 'en')}>
        Toggle
      </button>
      <button onClick={() => setLanguage('en')}>Set English</button>
      <button onClick={() => setLanguage('fi')}>Set Finnish</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('provides default English language when localStorage is empty', () => {
    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  it('reads initial state from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('fi');

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('fi');
  });

  it('toggles language when setLanguage is called', async () => {
    const user = userEvent.setup();

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(screen.getByTestId('language')).toHaveTextContent('fi');
  });

  it('persists language to localStorage on change', async () => {
    const user = userEvent.setup();

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set Finnish' }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'fi');
  });

  it('toggles back to English', async () => {
    const user = userEvent.setup();

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    // Toggle to Finnish
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('language')).toHaveTextContent('fi');

    // Toggle back to English
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  it('defaults to English for invalid localStorage value', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid');

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  it('sets specific language with setLanguage', async () => {
    const user = userEvent.setup();

    render(
      <LanguageContextProvider>
        <TestComponent />
      </LanguageContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set Finnish' }));
    expect(screen.getByTestId('language')).toHaveTextContent('fi');

    await user.click(screen.getByRole('button', { name: 'Set English' }));
    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  it('throws error when useLanguage is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ComponentOutsideProvider = () => {
      useLanguage();
      return null;
    };

    expect(() => render(<ComponentOutsideProvider />)).toThrow(
      'useLanguage must be used within a LanguageContextProvider'
    );

    consoleError.mockRestore();
  });

  it('throws error when useSetLanguage is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ComponentOutsideProvider = () => {
      useSetLanguage();
      return null;
    };

    expect(() => render(<ComponentOutsideProvider />)).toThrow(
      'useSetLanguage must be used within a LanguageContextProvider'
    );

    consoleError.mockRestore();
  });
});
