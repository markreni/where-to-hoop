import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../test-utils';
import { PlayersPanel } from '../../components/PlayersPanel';
import type { PlayerEnrollment } from '../../types/types';

const mockUser = { id: 'viewer-1', user_metadata: { nickname: 'Viewer' } }

vi.mock('../../contexts/AuthContext.tsx', async () => {
  const actual = await vi.importActual<typeof import('../../contexts/AuthContext.tsx')>('../../contexts/AuthContext.tsx')
  return { ...actual, useAuth: () => ({ user: mockUser, signOut: vi.fn() }) }
})

describe('PlayersPanel', () => {
  // Use fixed date for consistent testing
  const fixedNow = new Date('2024-01-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createEnrollment = (overrides: Partial<PlayerEnrollment> = {}): PlayerEnrollment => ({
    id: 'test-1',
    playerId: 'test',
    playerNickname: 'TestPlayer',
    hoopId: 'hoop-1',
    arrivalTime: fixedNow,
    duration: 60,
    expired: false,
    playMode: 'open',
    createdAt: new Date(fixedNow.getTime() - 30 * 60000),
    ...overrides,
  });

  it('renders the title', () => {
    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[]} />);
    expect(screen.getByText("Who's Playing")).toBeInTheDocument();
  });

  it('shows no players message when empty', () => {
    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[]} />);
    expect(screen.getByText('No one here yet. Be the first!')).toBeInTheDocument();
  });

  it('shows "Playing Now" section for players currently at court', () => {
    const playingNowEnrollment = createEnrollment({
      id: 'playing-1',
      playerId: 'alice',
      arrivalTime: new Date(fixedNow.getTime() - 10 * 60000), // 10 mins ago
      duration: 60,
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[playingNowEnrollment]} />);
    expect(screen.getByText('Playing Now (1)')).toBeInTheDocument();
  });

  it('shows "Coming Soon" section for players arriving later today', () => {
    const comingSoonEnrollment = createEnrollment({
      id: 'coming-soon-1',
      playerId: 'bob',
      arrivalTime: new Date(fixedNow.getTime() + 15 * 60000), // in 15 mins (still today)
      duration: 60,
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[comingSoonEnrollment]} />);
    expect(screen.getByText('Coming Soon (1)')).toBeInTheDocument();
  });

  it('shows "Coming Later" section for players arriving on a future day', () => {
    const comingLaterEnrollment = createEnrollment({
      id: 'coming-later-1',
      playerId: 'charlie',
      arrivalTime: new Date(fixedNow.getTime() + 24 * 60 * 60000), // tomorrow
      duration: 60,
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[comingLaterEnrollment]} />);
    expect(screen.getByText('Coming Later (1)')).toBeInTheDocument();
  });

  it('groups multiple players correctly', () => {
    const enrollments: PlayerEnrollment[] = [
      createEnrollment({
        id: 'playing-1',
        playerId: 'alice',
        arrivalTime: new Date(fixedNow.getTime() - 10 * 60000), // playing now
        duration: 60,
      }),
      createEnrollment({
        id: 'playing-2',
        playerId: 'bob',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000), // playing now
        duration: 45,
      }),
      createEnrollment({
        id: 'coming-soon-1',
        playerId: 'charlie',
        arrivalTime: new Date(fixedNow.getTime() + 20 * 60000), // later today
        duration: 60,
      }),
      createEnrollment({
        id: 'coming-later-1',
        playerId: 'diana',
        arrivalTime: new Date(fixedNow.getTime() + 2 * 24 * 60 * 60000), // in 2 days
        duration: 120,
      }),
    ];

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={enrollments} />);
    expect(screen.getByText('Playing Now (2)')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon (1)')).toBeInTheDocument();
    expect(screen.getByText('Coming Later (1)')).toBeInTheDocument();
  });

  it('displays player nickname as a link to their profile', () => {
    const enrollment = createEnrollment({
      playerNickname: 'Alice',
      arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
      duration: 60,
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
    const link = screen.getByRole('link', { name: '@Alice' });
    expect(link).toHaveAttribute('href', '/players/alice');
  });

  it('shows "until" time for playing now players', () => {
    const enrollment = createEnrollment({
      playerId: 'alice',
      arrivalTime: new Date(fixedNow.getTime() - 30 * 60000), // started 30 mins ago
      duration: 60, // 30 mins remaining
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
    expect(screen.getByText(/until/)).toBeInTheDocument();
  });

  it('shows arrival time for coming soon players', () => {
    const enrollment = createEnrollment({
      playerId: 'bob',
      arrivalTime: new Date(fixedNow.getTime() + 15 * 60000), // in 15 mins
      duration: 60,
    });

    render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
    expect(screen.getByText(/in 15 min/)).toBeInTheDocument();
  });

  describe('note functionality', () => {
    it('displays custom note when provided', () => {
      const enrollment = createEnrollment({
        playerId: 'alice',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'open',
        note: 'Looking for 3v3 game!',
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
      expect(screen.getByText('Looking for 3v3 game!')).toBeInTheDocument();
    });

    it('shows default open message when no note and playMode is open', () => {
      const enrollment = createEnrollment({
        playerId: 'bob',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'open',
        note: undefined,
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
      expect(screen.getByText('Please join me to hoop')).toBeInTheDocument();
    });

    it('shows default solo message when no note and playMode is solo', () => {
      const enrollment = createEnrollment({
        playerId: 'charlie',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'solo',
        note: undefined,
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
      expect(screen.getByText('Prefer to hoop alone this time')).toBeInTheDocument();
    });

    it('shows default message when note is empty string', () => {
      const enrollment = createEnrollment({
        playerId: 'diana',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'open',
        note: '',
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
      expect(screen.getByText('Please join me to hoop')).toBeInTheDocument();
    });

    it('shows Join button only for open playMode', () => {
      const openEnrollment = createEnrollment({
        id: 'open-1',
        playerId: 'eve',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'open',
      });
      const soloEnrollment = createEnrollment({
        id: 'solo-1',
        playerId: 'frank',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'solo',
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[openEnrollment, soloEnrollment]} />);

      const joinButtons = screen.getAllByRole('button', { name: /join/i });
      expect(joinButtons).toHaveLength(1);
    });

    it('does not show Join button for solo players', () => {
      const enrollment = createEnrollment({
        playerId: 'grace',
        arrivalTime: new Date(fixedNow.getTime() - 5 * 60000),
        duration: 60,
        playMode: 'solo',
      });

      render(<PlayersPanel hoopCoordinates={{ latitude: 60.17, longitude: 24.94 }} hoopEnrollments={[enrollment]} />);
      expect(screen.queryByRole('button', { name: /join/i })).not.toBeInTheDocument();
    });
  });
});
