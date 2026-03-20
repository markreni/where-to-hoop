import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/style.css'
import { LocationContextProvider } from './contexts/LocationContext.tsx'
import { ColorModeContextProvider } from './contexts/ColorModeContext.tsx'
import { MapViewContextProvider } from './contexts/MapViewContext.tsx'
import { LanguageContextProvider } from './contexts/LanguageContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { AuthContextProvider } from './contexts/AuthContext.tsx'
import { BrowserRouter as RouterContext } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterContext>
      <QueryClientProvider client={new QueryClient()}>
      <LocationContextProvider>
        <ColorModeContextProvider>
          <MapViewContextProvider>
            <LanguageContextProvider>
              <ToastProvider>
                <AuthContextProvider>
                  <App />
                </AuthContextProvider>
              </ToastProvider>
            </LanguageContextProvider>
          </MapViewContextProvider>
        </ColorModeContextProvider>
      </LocationContextProvider>
      </QueryClientProvider>
    </RouterContext>
  </StrictMode>
)
