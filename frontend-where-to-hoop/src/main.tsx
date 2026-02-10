import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/style.css'
import { LocationContextProvider } from './contexts/LocationContext.tsx'
import { ColorModeContextProvider } from './contexts/ColorModeContext.tsx'
import { MapViewContextProvider } from './contexts/MapViewContext.tsx'
import { LanguageContextProvider } from './contexts/LanguageContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { BrowserRouter as RouterContext } from "react-router-dom"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterContext>
      <LocationContextProvider>
        <ColorModeContextProvider>
          <MapViewContextProvider>
            <LanguageContextProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </LanguageContextProvider>
          </MapViewContextProvider>
        </ColorModeContextProvider>
      </LocationContextProvider>
    </RouterContext>
  </StrictMode>
)
