import type { BasketballHoop } from './types/types';
import mockPlayers from './mockplayers';

const [alice, bob, charlie, diana, ethan, fiona, mika, tomas, liisa, ville] = mockPlayers;

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
    address: 'Central Park 11, 00530, Helsinki',
    condition: 'good',
    isIndoor: false,
    createdAt: new Date().toISOString(),
    playerEnrollments: [
      {
        id: 'enroll-1',
        player: alice,
        hoopId: '1',
        arrivalTime: new Date(new Date().getTime() - 10 * 60000), // 10 mins ago
        duration: 60,
        note: 'Looking for some pickup games!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 15 * 60000), // 15 mins ago
      },
      {
        id: 'enroll-2',
        player: bob,
        hoopId: '1',
        arrivalTime: new Date(new Date().getTime() + 20 * 60000), // in 20 mins
        duration: 90,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
      },
      {
        id: 'enroll-later-1',
        player: mika,
        hoopId: '1',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 24, 10, 0, 0)), // tomorrow morning
        duration: 90,
        note: 'Morning workout session, all welcome!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 2 * 60 * 60000), // 2 hours ago
      },
      {
        id: 'enroll-later-2',
        player: fiona,
        hoopId: '1',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 48, 17, 0, 0)), // in 2 days, evening
        duration: 60,
        note: 'Looking for 3v3',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 30 * 60000), // 30 mins ago
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
    address: 'Downtown Center 5, 00100, Helsinki',
    condition: 'excellent',
    isIndoor: true,
    createdAt: new Date().toISOString(),
    playerEnrollments: [
      {
        id: 'enroll-3',
        player: charlie,
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() - 30 * 60000), // 30 mins ago
        duration: 120,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 40 * 60000), // 40 mins ago
      },
      {
        id: 'enroll-4',
        player: diana,
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() + 10 * 60000), // in 10 mins
        duration: 60,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 2 * 60000), // 2 mins ago
      },
      {
        id: 'enroll-5',
        player: ethan,
        hoopId: '2',
        arrivalTime: new Date(new Date().getTime() + 50 * 60000), // in 50 mins
        duration: 90,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 1 * 60000), // 1 min ago
      },
      {
        id: 'enroll-later-3',
        player: bob,
        hoopId: '2',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 24, 12, 0, 0)), // tomorrow afternoon
        duration: 120,
        note: 'Afternoon practice, bring your A-game!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 4 * 60 * 60000), // 4 hours ago
      },
      {
        id: 'enroll-later-4',
        player: liisa,
        hoopId: '2',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 72, 18, 0, 0)), // in 3 days, evening
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 60 * 60000), // 1 hour ago
      },
      {
        id: 'enroll-later-5',
        player: ville,
        hoopId: '2',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 168, 9, 0, 0)), // in 1 week, morning
        duration: 90,
        note: 'Weekend morning hoops!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 12 * 60 * 60000), // 12 hours ago
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
    address: 'Riverside Park 7, 00550, Helsinki',
    condition: 'fair',
    isIndoor: false,
    createdAt: new Date().toISOString(),
    playerEnrollments: [
      {
        id: 'enroll-6',
        player: fiona,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 5 * 60000), // in 5 mins
        duration: 45,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 3 * 60000), // 3 mins ago
      },
      {
        id: 'enroll-7',
        player: ethan,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 120 * 60000), // in 120 mins
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 10 * 60000), // 10 mins ago
      },
      {
        id: 'enroll-8',
        player: alice,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() - 20 * 60000), // 20 mins ago
        duration: 30,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 25 * 60000), // 25 mins ago
      },
      {
        id: 'enroll-9',
        player: bob,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 200 * 60000), // in 200 mins
        duration: 90,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 15 * 60000), // 15 mins ago
      },
      {
        id: 'enroll-10',
        player: diana,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 15 * 60000), // in 15 mins
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
      },
      {
        id: 'enroll-11',
        player: ville,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() - 5 * 60000), // 5 mins ago
        duration: 60,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 8 * 60000), // 8 mins ago
      },
      {
        id: 'enroll-12',
        player: charlie,
        hoopId: '3',
        arrivalTime: new Date(new Date().getTime() + 300 * 60000), // in 300 mins
        duration: 120,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 20 * 60000), // 20 mins ago
      },
      {
        id: 'enroll-later-6',
        player: tomas,
        hoopId: '3',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 24, 21, 0, 0)), // tomorrow night
        duration: 60,
        note: 'Night session under the lights',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 45 * 60000), // 45 mins ago
      },
      {
        id: 'enroll-later-7',
        player: liisa,
        hoopId: '3',
        arrivalTime: new Date(new Date().setHours(new Date().getHours() + 120, 14, 0, 0)), // in 5 days, afternoon
        duration: 90,
        note: 'Casual shooting practice',
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 3 * 60 * 60000), // 3 hours ago
      }
    ],
  },
  {
    id: '4',
    name: 'Kallio Playground',
    coordinates: {
      latitude: 60.18450741939996,
      longitude: 24.957467801354446,
    },
    profile_images: [
      {
        imageName: 'https://basketballengland.co.uk/images/preview/68b1aa03ca261_bosworth-academy-basketball-courts-3-290825142419.webp',
        id: 4,
        addedDate: new Date().toISOString()
      }
    ],
    description: 'Neighborhood court with one hoop, popular with locals',
    condition: 'poor',
    isIndoor: false,
    createdAt: new Date().toISOString(),
    playerEnrollments: [
      {
        id: 'enroll-13',
        player: mika,
        hoopId: '4',
        arrivalTime: new Date(new Date().getTime() - 15 * 60000),
        duration: 45,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 20 * 60000),
      },
    ],
  },
  {
    id: '5',
    name: 'Töölö Sports Hall',
    coordinates: {
      latitude: 60.17850741939996,
      longitude: 24.927467801354446,
    },
    profile_images: [
      {
        imageName: 'https://basketballengland.co.uk/images/preview/68b1aa03ca261_bosworth-academy-basketball-courts-3-290825142419.webp',
        id: 5,
        addedDate: new Date().toISOString()
      }
    ],
    description: 'Indoor hall with two full-size courts and great lighting',
    address: 'Töölönkatu 42, 00250, Helsinki',
    condition: 'excellent',
    isIndoor: true,
    createdAt: new Date().toISOString(),
    playerEnrollments: [
      {
        id: 'enroll-14',
        player: tomas,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 25 * 60000),
        duration: 90,
        note: 'Running 5v5, need two more!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 30 * 60000),
      },
      {
        id: 'enroll-15',
        player: liisa,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 20 * 60000),
        duration: 60,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 25 * 60000),
      },
      {
        id: 'enroll-16',
        player: charlie,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 15 * 60000),
        duration: 120,
        note: 'Warming up, come join!',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 20 * 60000),
      },
      {
        id: 'enroll-17',
        player: diana,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 10 * 60000),
        duration: 60,
        playMode: 'solo',
        createdAt: new Date(new Date().getTime() - 15 * 60000),
      },
      {
        id: 'enroll-18',
        player: ville,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 5 * 60000),
        duration: 90,
        note: 'Shooting drills',
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 10 * 60000),
      },
      {
        id: 'enroll-19',
        player: ethan,
        hoopId: '5',
        arrivalTime: new Date(new Date().getTime() - 2 * 60000),
        duration: 75,
        playMode: 'open',
        createdAt: new Date(new Date().getTime() - 8 * 60000),
      },
    ],
  },
];

export default initialHoops;
