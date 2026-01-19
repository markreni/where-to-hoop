import { createContext, useReducer, useContext, type Dispatch, type ReactNode, useEffect} from 'react'
import type { Coordinates, LocationSource } from "../types/types";


interface LocationState {
  userLocation: Coordinates;  // Persistent user geolocation
  mapCenter: Coordinates;     // Current map center (can be user or hoop location)
  source: LocationSource;     // What the mapCenter represents
}

type LocationAction =
  | { type: 'SET_USER_LOCATION'; payload: Coordinates }
  | { type: 'SET_MAP_CENTER'; payload: { coordinates: Coordinates; source: LocationSource } };

interface LocationContextValue {
  state: LocationState;
  dispatch: Dispatch<LocationAction>;
}

interface LocationProviderProps {
  children: ReactNode;
}

const initialCoordinates: Coordinates = {
  latitude: null,
  longitude: null,
};

const initialState: LocationState = {
  userLocation: initialCoordinates,
  mapCenter: initialCoordinates,
  source: 'user',
};

// lazy initializer reads from localStorage if present
const initState = (init: LocationState): LocationState => {
  try {
    const raw: string | null = localStorage.getItem('locationState');
    return raw ? JSON.parse(raw) : init;
  } catch {
    return init;
  }
}

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_USER_LOCATION':
      // When setting user location, update both userLocation and mapCenter
      return {
        ...state,
        userLocation: action.payload,
        mapCenter: action.payload,
        source: 'user',
      };
    case 'SET_MAP_CENTER':
      // When centering on a hoop, only update mapCenter (preserve userLocation)
      return {
        ...state,
        mapCenter: action.payload.coordinates,
        source: action.payload.source,
      };
    default:
      return state;
  }
}

const LocationContext = createContext<LocationContextValue | null>(null);

export const LocationContextProvider: React.FC<LocationProviderProps> = (props) => {
  const [state, dispatch] = useReducer(locationReducer, initialState, initState)

  useEffect(() => {
      try {
        localStorage.setItem('locationState', JSON.stringify(state));
      } catch {
        localStorage.setItem('locationState', JSON.stringify(initialState));
      }
    }, [state]);

  return (
    <LocationContext.Provider value={{ state, dispatch }}>
      {props.children}
    </LocationContext.Provider>
  )
}

// Returns the full location state (userLocation, mapCenter, source)
export const useLocationState = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.state;
}

// Returns just the mapCenter coordinates (for backward compatibility with map centering)
export const useLocationValues = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.state.mapCenter;
}

// Returns just the user's actual location coordinates
export const useUserLocation = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.state.userLocation;
}

export const useLocationDispatch = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.dispatch;
}

export default LocationContext;