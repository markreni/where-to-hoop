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
  return action;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export const ColorModeContextProvider: React.FC<ColorModeProviderProps> = (props) => {
  const [state, dispatch] = useReducer(colorModeReducer, initialState, initState)
 
   useEffect(() => {
    try {
      localStorage.setItem('colorMode', state);
    } catch {
      localStorage.setItem('colorMode', 'light');
    }
    // Sync .dark class on <html> so global CSS selectors (e.g. Leaflet popups) work
    /* 
      Leaflet renders popups into its own DOM containers outside React tree. 
      Without dark on a high-level element like <html>, the CSS    
      selector .dark .leaflet-popup-content-wrapper had no matching ancestor.  
    */
    document.documentElement.classList.toggle('dark', state === 'dark');
  }, [state]);
  

  return (
    <ColorModeContext.Provider value={{ state, dispatch }}>
      {props.children}
    </ColorModeContext.Provider>
  )
}

export const useColorModeValues = () => {
  const ctx = useContext(ColorModeContext)!;
  if (!ctx) {
    throw new Error('useColorModeValues must be used within a ColorModeContextProvider');
  }
  return ctx.state
}

export const useColorModeDispatch = () => {
  const ctx = useContext(ColorModeContext)!;
  if (!ctx) {
    throw new Error('useColorModeDispatch must be used within a ColorModeContextProvider');
  }
  return ctx.dispatch
}

export default ColorModeContext;