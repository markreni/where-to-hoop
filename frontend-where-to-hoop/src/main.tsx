import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/style.css'
import { LocationContextProvider } from './LocationContext.tsx'

import { BrowserRouter as RouterContext } from "react-router-dom"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterContext>
      <LocationContextProvider>
        <App />
      </LocationContextProvider>
    </RouterContext>
  </StrictMode>
)
