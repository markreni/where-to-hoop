import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mocks ──

const mockUser = {
  id: 'mock-user-id',
  email: 'mock@example.com',
  user_metadata: { nickname: 'MockUser' },
};

let currentUser: typeof mockUser | null = mockUser;

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: currentUser, signOut: vi.fn() }),
}));

const mockFetchFavorites = vi.fn<(userId: string) => Promise<string[]>>();
const mockToggleFavoriteRequest = vi.fn<(userId: string, hoopId: string, add: boolean) => Promise<void>>();

vi.mock('../../services/requests', () => ({
  fetchFavorites: (...args: [string]) => mockFetchFavorites(...args),
  toggleFavoriteRequest: (...args: [string, string, boolean]) => mockToggleFavoriteRequest(...args),
}));

// ── Helpers ──

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

async function renderUseFavorites() {
  const { useFavorites } = await import('../../hooks/useFavorites');
  return renderHook(() => useFavorites(), { wrapper: createWrapper() });
}

/** Creates a promise that can be resolved/rejected externally. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// ── Tests ──

describe('useFavorites', () => {
  beforeEach(() => {
    currentUser = mockUser;
    mockFetchFavorites.mockReset();
    mockToggleFavoriteRequest.mockReset();
    mockFetchFavorites.mockResolvedValue([]);
    mockToggleFavoriteRequest.mockResolvedValue(undefined);
  });

  it('fetches favorites for the authenticated user', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1', 'hoop-2']);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchFavorites).toHaveBeenCalledWith('mock-user-id');
    expect(result.current.favoriteIds).toEqual(['hoop-1', 'hoop-2']);
  });

  it('returns empty array when no user is authenticated', async () => {
    currentUser = null;

    const { result } = await renderUseFavorites();

    // Query should not fire (enabled: !!user is false)
    expect(mockFetchFavorites).not.toHaveBeenCalled();
    expect(result.current.favoriteIds).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('isFavorited returns true for favorited hoops', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1', 'hoop-3']);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isFavorited('hoop-1')).toBe(true);
    expect(result.current.isFavorited('hoop-3')).toBe(true);
    expect(result.current.isFavorited('hoop-2')).toBe(false);
  });

  it('toggleFavorite adds a hoop that is not favorited (optimistic update)', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1']);
    // Hold the mutation open so onSettled doesn't fire and refetch
    const { promise, resolve } = deferred();
    mockToggleFavoriteRequest.mockReturnValue(promise);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleFavorite('hoop-2');
    });

    // Optimistic update visible while mutation is in-flight
    await waitFor(() => {
      expect(result.current.favoriteIds).toContain('hoop-2');
    });
    expect(result.current.favoriteIds).toContain('hoop-1');
    expect(mockToggleFavoriteRequest).toHaveBeenCalledWith('mock-user-id', 'hoop-2', true);

    // Let mutation complete – refetch returns updated data
    mockFetchFavorites.mockResolvedValue(['hoop-1', 'hoop-2']);
    await act(async () => resolve());
  });

  it('toggleFavorite removes a hoop that is already favorited (optimistic update)', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1', 'hoop-2']);
    const { promise, resolve } = deferred();
    mockToggleFavoriteRequest.mockReturnValue(promise);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleFavorite('hoop-2');
    });

    // Optimistic update visible while mutation is in-flight
    await waitFor(() => {
      expect(result.current.favoriteIds).not.toContain('hoop-2');
    });
    expect(result.current.favoriteIds).toEqual(['hoop-1']);
    expect(mockToggleFavoriteRequest).toHaveBeenCalledWith('mock-user-id', 'hoop-2', false);

    // Let mutation complete
    mockFetchFavorites.mockResolvedValue(['hoop-1']);
    await act(async () => resolve());
  });

  it('toggleFavorite does nothing when user is not authenticated', async () => {
    currentUser = null;

    const { result } = await renderUseFavorites();

    act(() => {
      result.current.toggleFavorite('hoop-1');
    });

    expect(mockToggleFavoriteRequest).not.toHaveBeenCalled();
  });

  it('rolls back optimistic update on mutation error', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1']);
    const { promise, reject } = deferred();
    mockToggleFavoriteRequest.mockReturnValue(promise);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.toggleFavorite('hoop-2');
    });

    // Optimistic update visible while mutation is in-flight
    await waitFor(() => {
      expect(result.current.favoriteIds).toContain('hoop-2');
    });

    // Reject → triggers onError (rollback) + onSettled (refetch)
    await act(async () => reject(new Error('Network error')));

    await waitFor(() => {
      expect(result.current.favoriteIds).not.toContain('hoop-2');
    });
    expect(result.current.favoriteIds).toEqual(['hoop-1']);
  });

  it('handles optimistic update when cache has no prior data (old ?? [] fallback)', async () => {
    // Hold the initial fetch so the cache stays undefined
    const fetchDeferred = deferred<string[]>();
    mockFetchFavorites.mockReturnValue(fetchDeferred.promise);
    const mutationDeferred = deferred();
    mockToggleFavoriteRequest.mockReturnValue(mutationDeferred.promise);

    const { result } = await renderUseFavorites();

    // Query is still loading — cache is undefined
    expect(result.current.isLoading).toBe(true);

    // Trigger mutation while cache has no data → `old` is undefined → `old ?? []` kicks in
    act(() => {
      result.current.toggleFavorite('hoop-new');
    });

    await waitFor(() => {
      expect(result.current.favoriteIds).toContain('hoop-new');
    });

    // Complete everything
    fetchDeferred.resolve(['hoop-new']);
    mockFetchFavorites.mockResolvedValue(['hoop-new']);
    await act(async () => mutationDeferred.resolve());
  });

  it('deduplicates when adding an already-present hoop via optimistic update', async () => {
    mockFetchFavorites.mockResolvedValue(['hoop-1']);

    const { result } = await renderUseFavorites();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // hoop-1 is already favorited, so toggleFavorite calls add: false (remove)
    act(() => {
      result.current.toggleFavorite('hoop-1');
    });

    await waitFor(() => {
      expect(mockToggleFavoriteRequest).toHaveBeenCalledWith('mock-user-id', 'hoop-1', false);
    });
  });
});
