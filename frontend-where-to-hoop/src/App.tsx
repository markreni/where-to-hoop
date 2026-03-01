import { useEffect, useMemo, useState } from "react";
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
import { ToastContainer } from './components/reusable/ToastContainer.tsx';
import Hoops from './pages/Hoops.tsx';
import AddHoop from './pages/AddHoop.tsx';
import Home from './pages/Home.tsx';
import Hoop from "./pages/Hoop.tsx";
import About from "./pages/About.tsx";
import Privacy from "./pages/Privacy.tsx";
import Contact from "./pages/Contact.tsx";
import Info from "./pages/Info.tsx";
import initialHoops from "./mockhoops.tsx";
import { helsinkiBounds } from "./utils/constants.ts";
import type { BasketballHoopWithEnrollments } from "./types/types.ts";
import supabase from './utils/supabase'


function App() {
  const [hoops, setHoops] = useState<BasketballHoopWithEnrollments[]>([])
  const match = useMatch("/hoops/:id");

  // Filter hoops to only include those within Helsinki greater area
  const filteredHoops: BasketballHoopWithEnrollments[] = useMemo(() => {
    const [[swLat, swLng], [neLat, neLng]] = helsinkiBounds as [[number, number], [number, number]];
    return initialHoops.filter(hoop => {
      const { latitude, longitude } = hoop.coordinates;
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) return false;
      return latitude >= swLat && latitude <= neLat && longitude >= swLng && longitude <= neLng;
    });
  }, []);

  const hoop = match?.params.id ? hoops.find(h => h.id === match.params.id) : undefined

  useEffect(() => {
    async function getHoops() {
      const { data, error } = await supabase.from('basketball_hoop').select()

      if (error) {
        console.error("Error fetching hoops:", error);
        return;
      }

      if (data && data.length > 1) {
        setHoops(data)
      }
    }

    getHoops()
  }, [])

  return (
    <div
      className="poppins-extralight bg-gradient-to-t from-second-color to-first-color min-h-screen overflow-hidden relative"
    >
      <NavBar />
      <ToastContainer />
      <div className="routes-margin">
        <Routes>
          <Route path="/" element={<Home hoops={filteredHoops} />} />
          <Route path="/hoops" element={<Hoops hoops={filteredHoops} />} />
          <Route path="/hoops/:id" element={<Hoop hoop={hoop} />} />
          <Route path="/addhoop" element={<AddHoop />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Info/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App
