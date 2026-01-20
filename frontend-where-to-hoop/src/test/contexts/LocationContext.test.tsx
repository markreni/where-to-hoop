import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LocationContextProvider,
  useLocationState,
  useLocationValues,
  useUserLocation,
  useLocationDispatch,
} from '../../contexts/LocationContext';

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

// Test component that displays location state
const TestComponent = () => {
  const state = useLocationState();
  const mapCenter = useLocationValues();
  const userLocation = useUserLocation();
  const dispatch = useLocationDispatch();

  return (
    <div>
      <span data-testid="source">{state.source}</span>
      <span data-testid="map-lat">{mapCenter.latitude ?? 'null'}</span>
      <span data-testid="map-lng">{mapCenter.longitude ?? 'null'}</span>
      <span data-testid="user-lat">{userLocation.latitude ?? 'null'}</span>
      <span data-testid="user-lng">{userLocation.longitude ?? 'null'}</span>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_USER_LOCATION',
            payload: { latitude: 60.1699, longitude: 24.9384 },
          })
        }
      >
        Set User Location
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_MAP_CENTER',
            payload: {
              coordinates: { latitude: 60.2, longitude: 25.0 },
              source: 'hoop',
            },
          })
        }
      >
        Center on Hoop
      </button>
    </div>
  );
};

describe('LocationContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('provides initial null coordinates', () => {
    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    expect(screen.getByTestId('map-lat')).toHaveTextContent('null');
    expect(screen.getByTestId('map-lng')).toHaveTextContent('null');
    expect(screen.getByTestId('user-lat')).toHaveTextContent('null');
    expect(screen.getByTestId('user-lng')).toHaveTextContent('null');
    expect(screen.getByTestId('source')).toHaveTextContent('user');
  });

  it('SET_USER_LOCATION updates both userLocation and mapCenter', async () => {
    const user = userEvent.setup();

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set User Location' }));

    expect(screen.getByTestId('user-lat')).toHaveTextContent('60.1699');
    expect(screen.getByTestId('user-lng')).toHaveTextContent('24.9384');
    expect(screen.getByTestId('map-lat')).toHaveTextContent('60.1699');
    expect(screen.getByTestId('map-lng')).toHaveTextContent('24.9384');
    expect(screen.getByTestId('source')).toHaveTextContent('user');
  });

  it('SET_MAP_CENTER updates mapCenter but preserves userLocation', async () => {
    const user = userEvent.setup();

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    // First set user location
    await user.click(screen.getByRole('button', { name: 'Set User Location' }));

    // Then center on hoop
    await user.click(screen.getByRole('button', { name: 'Center on Hoop' }));

    // userLocation should be preserved
    expect(screen.getByTestId('user-lat')).toHaveTextContent('60.1699');
    expect(screen.getByTestId('user-lng')).toHaveTextContent('24.9384');

    // mapCenter should be updated to hoop location
    expect(screen.getByTestId('map-lat')).toHaveTextContent('60.2');
    expect(screen.getByTestId('map-lng')).toHaveTextContent('25');

    // source should be 'hoop'
    expect(screen.getByTestId('source')).toHaveTextContent('hoop');
  });

  it('persists state to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Set User Location' }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'locationState',
      expect.stringContaining('60.1699')
    );
  });

  it('reads initial state from localStorage', () => {
    const savedState = {
      userLocation: { latitude: 60.5, longitude: 24.5 },
      mapCenter: { latitude: 60.5, longitude: 24.5 },
      source: 'user',
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    expect(screen.getByTestId('user-lat')).toHaveTextContent('60.5');
    expect(screen.getByTestId('user-lng')).toHaveTextContent('24.5');
  });

  it('useLocationValues returns mapCenter coordinates', async () => {
    const user = userEvent.setup();

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Center on Hoop' }));

    // useLocationValues should return mapCenter
    expect(screen.getByTestId('map-lat')).toHaveTextContent('60.2');
    expect(screen.getByTestId('map-lng')).toHaveTextContent('25');
  });

  it('useUserLocation returns user coordinates even when map is centered elsewhere', async () => {
    const user = userEvent.setup();

    render(
      <LocationContextProvider>
        <TestComponent />
      </LocationContextProvider>
    );

    // Set user location
    await user.click(screen.getByRole('button', { name: 'Set User Location' }));
    // Center on different location
    await user.click(screen.getByRole('button', { name: 'Center on Hoop' }));

    // useUserLocation should still return user's actual location
    expect(screen.getByTestId('user-lat')).toHaveTextContent('60.1699');
    expect(screen.getByTestId('user-lng')).toHaveTextContent('24.9384');
  });
});
