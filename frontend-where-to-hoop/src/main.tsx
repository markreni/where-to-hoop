import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/style.css'

import { BrowserRouter as RouterContext } from "react-router-dom"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterContext>
      <App />
    </RouterContext>
  </StrictMode>
)
