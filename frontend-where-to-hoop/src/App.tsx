import { useState } from 'react'
import {
  Routes,
  Route,
  //Link,
  //Navigate,
  //useParams,
  //useNavigate,
  useMatch,
} from "react-router-dom";
import NavBar from './components/NavBar.tsx';
import MapPage from './pages/MapPage.tsx';

function App() {

  return (
    <div>
      <NavBar />
      <div className="routes-margin">
        <Routes>
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
