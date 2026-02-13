
type Condition = 'excellent' | 'good' | 'fair' | 'poor';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ObservationImage {
  id: number;
  imageName: string;
  addedDate: string;
}

// Play mode type - whether player is open to play with others or solo
type PlayMode = 'open' | 'solo';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  profilePicture?: string; // Optional profile picture URL
  //skillLevel: number; // 1-10 scale
  //preferredPlayTimes: TimeSlot[]; // When they usually play
  //playModePreference: PlayMode; // Whether they prefer open play or solo hooping
  favoriteHoops: string[]; // IDs of their favorite hoops
}
// Player enrollment types
interface PlayerEnrollment {
  id: string;
  player: Player;
  hoopId: string;
  arrivalTime: Date; // When they plan to arrive
  duration: number; // How long they plan to play (in minutes)
  playMode: PlayMode; // Whether open to play or solo hooping
  note?: string; // Optional note to other players
  createdAt: Date;
}

interface BasketballHoop {
  readonly id: string;
  readonly createdAt: string; // ISO date string
  name: string;
  profile_images: ObservationImage[];
  coordinates: Coordinates;
  address?: string;
  description: string;
  condition: Condition;
  isIndoor: boolean;
  playerEnrollments: PlayerEnrollment[]; // Number of players currently at the court
};

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Color mode type
type ColorMode = 'light' | 'dark';

// Map view type - whether to show map or list view
type MapView = 'map' | 'list';

// Location source type - indicates whether coordinates are from user geolocation or hoop selection
type LocationSource = 'user' | 'hoop';

// Language type
type Language = 'en' | 'fi';

export type { BasketballHoop, Condition, Coordinates, ColorMode, MapView, ToastType, Language, LocationSource, Player, PlayerEnrollment, PlayMode, TimeSlot };

// type Popularity = 'popular' | 'average' | 'quiet';

// type Role = 'admin' | 'user' | 'moderator';

// type T = Record<string, BasketballHoop>;