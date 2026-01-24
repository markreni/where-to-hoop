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


function App() {
  const match = useMatch("/hoops/:id");
  const hoop = match?.params.id ? initialHoops.find(h => h.id === match.params.id) : undefined

  return (
    <div
      className="poppins-extralight bg-gradient-to-t from-second-color to-first-color min-h-screen overflow-hidden relative"
    >
      <NavBar />
      <ToastContainer />
      <div className="routes-margin">
        <Routes>
          <Route path="/" element={<Home hoops={initialHoops} />} />
          <Route path="/hoops" element={<Hoops hoops={initialHoops} />} />
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
