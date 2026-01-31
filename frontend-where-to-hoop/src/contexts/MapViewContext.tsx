import { createContext, useReducer, useContext, type Dispatch, type ReactNode, useEffect} from 'react'
import type { MapView } from "../types/types";


interface MapViewContextValue {
  state: MapView;
  dispatch: Dispatch<MapView>;
}

interface MapViewProviderProps {
  children: ReactNode;
}

const initialState: MapView = 'map';

// lazy initializer reads from localStorage if present
const initState = (init: MapView): MapView => {
  try {
    const raw: MapView | null = localStorage.getItem('mapView') as MapView | null;
    return raw ? (raw === 'list' ? 'list' : 'map') : init;
  } catch {
    return init;
  }
}

const mapViewReducer = (_: MapView, action: MapView ): MapView=> {
  return action;
}

const MapViewContext = createContext<MapViewContextValue | null>(null);

export const MapViewContextProvider: React.FC<MapViewProviderProps> = (props) => {
  const [state, dispatch] = useReducer(mapViewReducer, initialState, initState)

   useEffect(() => {
    try {
      localStorage.setItem('mapView', state);
    } catch {
      localStorage.setItem('mapView', 'map');
    }
  }, [state]);


  return (
    <MapViewContext.Provider value={{ state, dispatch }}>
      {props.children}
    </MapViewContext.Provider>
  )
}

export const useMapViewValues = () => {
  const ctx = useContext(MapViewContext)!;
  if (!ctx) {
    throw new Error('useMapViewValues must be used within a MapViewContextProvider');
  }
  return ctx.state
}

export const useMapViewDispatch = () => {
  const ctx = useContext(MapViewContext)!;
  if (!ctx) {
    throw new Error('useMapViewDispatch must be used within a MapViewContextProvider');
  }
  return ctx.dispatch
}

export default MapViewContext;
