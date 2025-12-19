import { createContext, useReducer, useContext, type Dispatch, type ReactNode, useEffect} from 'react'
import type { ColorMode } from "../types/types";


interface ColorModeContextValue {
  state: ColorMode;
  dispatch: Dispatch<ColorMode>;
}

interface ColorModeProviderProps {
  children: ReactNode;
}

const initialState: ColorMode = 'light';

// lazy initializer reads from localStorage if present
const initState = (init: ColorMode): ColorMode => {
  try {
    const raw: ColorMode | null = localStorage.getItem('colorMode') as ColorMode | null;
    return raw ? (raw === 'dark' ? 'dark' : 'light') : init;
  } catch {
    return init;
  }
}

const colorModeReducer = (_: ColorMode, action: ColorMode ): ColorMode=> {
  return action
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export const ColorModeContextProvider: React.FC<ColorModeProviderProps> = (props) => {
  const [state, dispatch] = useReducer(colorModeReducer, initState(initialState))
 
   useEffect(() => {
    try {
      localStorage.setItem('colorMode', JSON.stringify(state));
    } catch {
      localStorage.setItem('colorMode', 'light');
    }
  }, [state]);
  

  return (
    <ColorModeContext.Provider value={{ state, dispatch }}>
      {props.children}
    </ColorModeContext.Provider>
  )
}

export const useColorModeValues = () => {
  const ctx = useContext(ColorModeContext)!;
  return ctx.state
}

export const useColorModeDispatch = () => {
  const ctx = useContext(ColorModeContext)!;
  return ctx.dispatch
}

export default ColorModeContext;