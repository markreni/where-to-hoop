import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Routes,
  Route,
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
import SignUp from "./pages/SignUp.tsx";
import SignIn from "./pages/SignIn.tsx";
import MyProfile from "./pages/MyProfile.tsx";
import Players from "./pages/Players.tsx";
import PlayerProfile from "./pages/PlayerProfile.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.tsx";
import { helsinkiBounds } from "./utils/constants.ts";
import type { BasketballHoop } from "./types/types.ts";
import { fetchHoops } from "./utils/requests.ts";


const App = () => {
  const match = useMatch("/hoops/:id");
  const adminEditMatch = useMatch("/admin/edit/:id");

  const { data: hoops = [], isLoading } = useQuery<BasketballHoop[]>({
    queryKey: ['hoops'],
    queryFn: fetchHoops,
  })

  const hoop = match?.params.id ? hoops.find(h => h.id === match.params.id) : undefined
  const editHoop = adminEditMatch?.params.id ? hoops.find(h => h.id === adminEditMatch.params.id) : undefined

  // Filter hoops to only include those within Helsinki greater area
  const filteredHoops: BasketballHoop[] = useMemo(() => {
    const [[swLat, swLng], [neLat, neLng]] = helsinkiBounds as [[number, number], [number, number]];
    return hoops.filter(hoop => {
      const { latitude, longitude } = hoop.coordinates;
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) return false;
      return latitude >= swLat && latitude <= neLat && longitude >= swLng && longitude <= neLng;
    });
  }, [hoops]);

  if (isLoading) {
    return (
      <div className="poppins-extralight bg-gradient-to-t from-second-color to-first-color min-h-screen flex items-center justify-center">
        <p className="text-2xl text-text">Loading hoops...</p>
      </div>
    );
  }

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
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/myprofile" element={<MyProfile hoops={hoops} />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:nickname" element={<PlayerProfile hoops={hoops} />} />
          <Route path="/admin" element={<ProtectedAdminRoute><Admin hoops={hoops} /></ProtectedAdminRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedAdminRoute><AddHoop hoop={editHoop} /></ProtectedAdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
