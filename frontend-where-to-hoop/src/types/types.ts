
type Condition = 'excellent' | 'good' | 'fair' | 'poor';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface ObservationImage {
  id: number;
  imageName: string;
  addedDate: string;
}

// Play mode type - whether player is open to play with others or solo
type PlayMode = 'open' | 'solo';

// Player enrollment types
interface PlayerEnrollment {
  id: string;
  playerName: string;
  hoopId: string;
  arrivalTime: Date; // When they plan to arrive
  duration: number; // How long they plan to play (in minutes)
  playMode: PlayMode; // Whether open to play or solo hooping
  createdAt: Date;
}

interface BasketballHoop {
  readonly id: string;
  readonly createdAt: string; // ISO date string
  name: string;
  profile_images: ObservationImage[];
  coordinates: Coordinates;
  description: string;
  condition: Condition;
  isIndoor: boolean;
  playerEnrollments: PlayerEnrollment[]; // Number of players currently at the court
};

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Color mode type
type ColorMode = 'light' | 'dark';

// Location source type - indicates whether coordinates are from user geolocation or hoop selection
type LocationSource = 'user' | 'hoop';

// Language type
type Language = 'en' | 'fi';

export type { BasketballHoop, Condition, Coordinates, ColorMode, ToastType, Language, LocationSource, PlayerEnrollment, PlayMode };

// type Popularity = 'popular' | 'average' | 'quiet';

// type Role = 'admin' | 'user' | 'moderator';

// type T = Record<string, BasketballHoop>;