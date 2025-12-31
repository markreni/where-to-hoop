
type ColorMode = 'light' | 'dark';

type Condition = 'excellent' | 'good' | 'fair' | 'poor';

type Popularity = 'popular' | 'average' | 'quiet';

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
  id: string;
  name: string;
  profile_images: ObservationImage[];
  coordinates: Coordinates;
  description: string;
  condition: Condition;
  indoor: boolean;
  createdAt: string; // ISO date string
};

export type { BasketballHoop, Condition, Coordinates, ColorMode };