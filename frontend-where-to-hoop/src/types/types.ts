
type Condition = 'excellent' | 'good' | 'fair' | 'poor';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ObservationImage {
  id: number;
  imagePath: string;
  addedDate: string;
}

interface ProfileImage {
  imagePath: string;
  uploadedAt: string;
}

// Play mode type - whether player is open to play with others or solo
type PlayMode = 'open' | 'solo';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  profileImage: ProfileImage | null;
  //skillLevel: number; // 1-10 scale
  //preferredPlayTimes: TimeSlot[]; // When they usually play
  //playModePreference: PlayMode; // Whether they prefer open play or solo hooping
  favouriteHoops: string[]; // IDs of their favorite hoops
  public: boolean; // Whether the profile is publicly visible
  //enrolments: PlayerEnrollment[]; // Hoops they are currently enrolled in
}

interface PublicProfile {
  id: string;
  nickname: string;
  public: boolean;
  profileImage: ProfileImage | null;
}
// Player enrollment types
interface PlayerEnrollment {
  id: string;
  playerId: string | null; // ID of the player enrolled, can be null if user is deleted
  playerEmail?: string; // Email of the player, used for display if playerId is null
  playerNickname: string;
  hoopId: string | null; // ID of the hoop they are enrolled in, can be null if hoop is deleted
  hoopName?: string; // Name of the hoop for display purposes if hoopId is deleted
  arrivalTime: Date; // When they plan to arrive
  duration: number; // How long they plan to play (in minutes)
  expired: boolean; // Whether the enrollment time has passed
  playMode: PlayMode; // Whether open to play or solo hooping
  note?: string; // Optional note to other players
  createdAt: Date;
}

interface BasketballHoop {
  readonly id: string;
  readonly createdAt: string; // ISO date string
  name: string;
  images: ObservationImage[];
  coordinates: Coordinates;
  address?: string;
  description: string;
  condition: Condition;
  isIndoor: boolean;
  addedBy: string; // nickname of the user who added the hoop
  //playerEnrollments: PlayerEnrollment[]; // Number of players currently at the court
};

interface BasketballHoopWithEnrollments extends BasketballHoop {
    playerEnrollments: PlayerEnrollment[];
  }

type FollowRequestType = 'pending' | 'accepted' | 'rejected'; // keep 'rejected' for future cooldown implementation

interface FollowRequest {
  id: string
  fromUserId: string
  fromUserNickname: string
  toUserId: string
  status: FollowRequestType
  createdAt: Date
}

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

export type { BasketballHoop, Condition, Coordinates, ColorMode, MapView, ToastType, Language, LocationSource, User, PlayerEnrollment, PlayMode, TimeSlot, BasketballHoopWithEnrollments, PublicProfile, FollowRequest, ProfileImage };

// type Popularity = 'popular' | 'average' | 'quiet';

// type Role = 'admin' | 'user' | 'moderator';

// type T = Record<string, BasketballHoop>;