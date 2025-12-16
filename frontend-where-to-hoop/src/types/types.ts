
type condition = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

interface BasketballHoop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  condition: condition;
  indoor: boolean;
  createdAt: string; // ISO date string
};

export type { BasketballHoop, condition };