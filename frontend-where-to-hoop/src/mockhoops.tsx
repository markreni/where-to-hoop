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
    playerEnrollments: [
      {
        id: 'enroll-1',
        playerName: 'Alice',
        hoopId: '1',
        arrivalTime: new Date(new Date().getTime() - 10 * 60000), // 10 mins ago
        duration: 60,
        note: 'Looking for some pickup games!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 15 * 60000), // 15 mins ago
      },
      {
        id: 'enroll-2',
        playerName: 'Bob',
        hoopId: '1',
        arrivalTime: new Date(new Date().getTime() + 20 * 60000), // in 20 mins
        duration: 90,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
      },
    ],
  },
  {
    id: '2',
    name: 'Downtown Center',
    coordinates: {
      latitude: 60.271550741939996,
      longitude: 24.977467801354446,
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
    playerEnrollments: [
      {
        id: 'enroll-3',
        playerName: 'Charlie',
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() - 30 * 60000), // 30 mins ago
        duration: 120,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 40 * 60000), // 40 mins ago
      },
      {
        id: 'enroll-4',
        playerName: 'Diana',
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() + 10 * 60000), // in 10 mins
        duration: 60,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 2 * 60000), // 2 mins ago
      },
      {
        id: 'enroll-5',
        playerName: 'Ethan',
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() + 50 * 60000), // in 50 mins
        duration: 90,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 1 * 60000), // 1 min ago
      }
    ],
  },
  {
    id: '3',
    name: 'Riverside Court',
    coordinates: {
      latitude: 60.41550741939996,
      longitude: 25.147467801354446,
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
    playerEnrollments: [
      {
        id: 'enroll-6',
        playerName: 'Fiona',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 5 * 60000), // in 5 mins
        duration: 45,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 3 * 60000), // 3 mins ago
      },
      {
        id: 'enroll-7',
        playerName: 'George',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 120 * 60000), // in 120 mins
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 10 * 60000), // 10 mins ago
      },
      {
        id: 'enroll-8',
        playerName: 'Hannah',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() - 20 * 60000), // 20 mins ago
        duration: 30,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 25 * 60000), // 25 mins ago
      },
      {
        id: 'enroll-9',
        playerName: 'Ian',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 200 * 60000), // in 200 mins
        duration: 90,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 15 * 60000), // 15 mins ago
      },
      {
        id: 'enroll-10',
        playerName: 'Jane',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 15 * 60000), // in 15 mins
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
      },
      {
        id: 'enroll-11',
        playerName: 'Kevin',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
        duration: 60,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 8 * 60000), // 8 mins ago
      },
      {
        id: 'enroll-12',
        playerName: 'Laura',
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 300 * 60000), // in 300 mins
        duration: 120,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 20 * 60000), // 20 mins ago
      }
    ],
  },
];

export default initialHoops;
