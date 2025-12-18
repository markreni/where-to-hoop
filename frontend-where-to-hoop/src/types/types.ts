
type Condition = 'excellent' | 'good' | 'fair' | 'poor';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
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