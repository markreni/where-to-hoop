import type { User} from './types/types';

const mockPlayers: User[] = [
  {
    id: 'player-1',
    firstName: 'Alice',
    lastName: 'Korhonen',
    nickname: 'Ace',
    email: 'alice.korhonen@email.com',
    public: true,
    favouriteHoops: ['1', '3'],
    profileImage: null
  },
  {
    id: 'player-2',
    firstName: 'Bob',
    lastName: 'Virtanen',
    nickname: 'Bobby',
    email: 'bob.virtanen@email.com',
    public: true,
    favouriteHoops: ['1'],
    profileImage: null
  },
  {
    id: 'player-3',
    firstName: 'Charlie',
    lastName: 'Mäkinen',
    nickname: 'Chuck',
    email: 'charlie.makinen@email.com',
    public: true,
    favouriteHoops: ['2'],
    profileImage: null
  },
  {
    id: 'player-4',
    firstName: 'Diana',
    lastName: 'Laine',
    nickname: 'Di',
    email: 'diana.laine@email.com',
    public: true,
    favouriteHoops: ['2', '5'],
    profileImage: null
  },
  {
    id: 'player-5',
    firstName: 'Ethan',
    lastName: 'Niemi',
    nickname: 'E',
    email: 'ethan.niemi@email.com',
    public: true,
    favouriteHoops: ['2', '3'],
    profileImage: null
  },
  {
    id: 'player-6',
    firstName: 'Fiona',
    lastName: 'Heikkinen',
    nickname: 'Fi',
    email: 'fiona.heikkinen@email.com',
    public: true,
    favouriteHoops: ['3'],
    profileImage: null
  },
  {
    id: 'player-7',
    firstName: 'Mika',
    lastName: 'Järvinen',
    nickname: 'Mikke',
    email: 'mika.jarvinen@email.com',
    public: true,
    favouriteHoops: ['4', '1'],
    profileImage: null
  },
  {
    id: 'player-8',
    firstName: 'Tomas',
    lastName: 'Lehtonen',
    nickname: 'Tommy',
    email: 'tomas.lehtonen@email.com',
    public: true,
    favouriteHoops: ['5'],
    profileImage: null
  },
  {
    id: 'player-9',
    firstName: 'Liisa',
    lastName: 'Salminen',
    nickname: 'Lii',
    email: 'liisa.salminen@email.com',
    public: true,
    favouriteHoops: ['5', '2'],
    profileImage: null
  },
  {
    id: 'player-10',
    firstName: 'Ville',
    lastName: 'Koskinen',
    nickname: 'V',
    email: 'ville.koskinen@email.com',
    public: true,
    favouriteHoops: ['5', '3'],
    profileImage: null
  },
];

export default mockPlayers;
