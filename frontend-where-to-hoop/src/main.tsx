import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/style.css'
import { LocationContextProvider } from './contexts/LocationContext.tsx'
import { ColorModeContextProvider } from './contexts/DarkModeContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { BrowserRouter as RouterContext } from "react-router-dom"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterContext>
      <LocationContextProvider>
        <ColorModeContextProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ColorModeContextProvider>
      </LocationContextProvider>
    </RouterContext>
  </StrictMode>
)
