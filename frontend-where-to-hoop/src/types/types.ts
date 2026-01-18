
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

interface BasketballHoop {
  readonly id: string;
  readonly createdAt: string; // ISO date string
  name: string;
  profile_images: ObservationImage[];
  coordinates: Coordinates;
  description: string;
  condition: Condition;
  isIndoor: boolean;
  currentPlayers: number; // Number of players currently at the court
};

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Color mode type
type ColorMode = 'light' | 'dark';

// Language type
type Language = 'en' | 'fi';


export type { BasketballHoop, Condition, Coordinates, ColorMode, ToastType, Language };

// type Popularity = 'popular' | 'average' | 'quiet';

// type Role = 'admin' | 'user' | 'moderator';

// type T = Record<string, BasketballHoop>;