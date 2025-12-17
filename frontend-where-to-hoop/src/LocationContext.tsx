import { createContext, useReducer, useContext, type Dispatch, type ReactNode} from 'react'
import type { Coordinates } from "./types/types";


interface LocationAction {
  payload: Coordinates
}

interface LocationContextValue {
  state: Coordinates;
  dispatch: Dispatch<LocationAction>;
}

interface LocationProviderProps {
  children: ReactNode;
}

const initialState: Coordinates = {
  latitude: null,
  longitude: null,
};

const locationReducer = (state: Coordinates, action: LocationAction ): Coordinates => {
  return {...state, ...action.payload}
}

const LocationContext = createContext<LocationContextValue | null>(null);

export const LocationContextProvider: React.FC<LocationProviderProps> = (props) => {
  const [state, dispatch] = useReducer(locationReducer, initialState)
  
  return (
    <LocationContext.Provider value={{ state, dispatch }}>
      {props.children}
    </LocationContext.Provider>
  )
}

export const useLocationValues = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.state
  //const counterAndDispatch: QuestionContextValue = useContext(FormContext)!
  //return counterAndDispatch.state
}

export const useLocationDispatch = () => {
  const ctx = useContext(LocationContext)!;
  return ctx.dispatch
  //const counterAndDispatch: QuestionContextValue  = useContext(FormContext)!
  //return counterAndDispatch.dispatch
}

export default LocationContext;