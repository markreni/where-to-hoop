import type { BasketballHoop } from './types/types';

// Mock data for initial hoops
const initialHoops: BasketballHoop[] = [
  {
    id: '1',
    name: 'Central Park Court',
    coordinates: {
      latitude: 60.171550741939996,
      longitude: 24.947467801354446,
    },
    description: 'Great outdoor court with two hoops',
    condition: 'good',
    indoor: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Downtown Recreation Center',
    coordinates: {
      latitude: 60.771550741939996,
      longitude: 24.947467801354446,
    },
    description: 'Indoor court, well maintained',
    condition: 'excellent',
    indoor: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Riverside Court',
    coordinates: {
      latitude: 60.571550741939996,
      longitude: 24.947467801354446,
    },
    description: 'Single hoop near the river',
    condition: 'fair',
    indoor: false,
    createdAt: new Date().toISOString(),
  },
];

export default initialHoops;