
type Condition = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface BasketballHoop {
  id: string;
  name: string;
  coordinates: Coordinates;
  description: string;
  condition: Condition;
  indoor: boolean;
  createdAt: string; // ISO date string
};

export type { BasketballHoop, Condition, Coordinates };