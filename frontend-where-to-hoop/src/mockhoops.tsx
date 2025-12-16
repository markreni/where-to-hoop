import type { BasketballHoop } from './types/types';

// Mock data for initial hoops
const initialHoops: BasketballHoop[] = [
  {
    id: '1',
    name: 'Central Park Court',
    latitude: 40.7829,
    longitude: -73.9654,
    description: 'Great outdoor court with two hoops',
    condition: 'good',
    indoor: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Downtown Recreation Center',
    latitude: 40.7589,
    longitude: -73.9851,
    description: 'Indoor court, well maintained',
    condition: 'excellent',
    indoor: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Riverside Court',
    latitude: 40.7989,
    longitude: -73.9684,
    description: 'Single hoop near the river',
    condition: 'fair',
    indoor: false,
    createdAt: new Date().toISOString(),
  },
];

export default initialHoops;