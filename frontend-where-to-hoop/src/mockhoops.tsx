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
    profile_images: [
      {
        imageName: 'https://basketballengland.co.uk/images/preview/68b1aa03ca261_bosworth-academy-basketball-courts-3-290825142419.webp', 
        id: 1, 
        addedDate: new Date().toISOString() 
      }
    ],
    description: 'Great outdoor court with two hoops',
    condition: 'good',
    isIndoor: false,
    createdAt: new Date().toISOString(),
    currentPlayers: 4,
  },
  {
    id: '2',
    name: 'Downtown Center',
    coordinates: {
      latitude: 60.771550741939996,
      longitude: 24.947467801354446,
    },
    profile_images: [
      {
        imageName: 'https://basketballengland.co.uk/images/preview/68b1aa03ca261_bosworth-academy-basketball-courts-3-290825142419.webp', 
        id: 2, 
        addedDate: new Date().toISOString() 
      }
    ],
    description: 'Indoor court, well maintained',
    condition: 'excellent',
    isIndoor: true,
    createdAt: new Date().toISOString(),
    currentPlayers: 0,
  },
  {
    id: '3',
    name: 'Riverside Court',
    coordinates: {
      latitude: 60.571550741939996,
      longitude: 24.947467801354446,
    },
    profile_images: [
      {
        imageName: 'https://basketballengland.co.uk/images/preview/68b1aa03ca261_bosworth-academy-basketball-courts-3-290825142419.webp', 
        id: 3, 
        addedDate: new Date().toISOString() 
      }
    ],
    description: 'Single hoop near the river',
    condition: 'fair',
    isIndoor: false,
    createdAt: new Date().toISOString(),
    currentPlayers: 2,
  },
];

export default initialHoops;