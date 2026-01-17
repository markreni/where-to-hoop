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


function App() {
  const match = useMatch("/hoops/:id");
  console.log("Matched observation ID:", match?.params.id);

  return (
    <div
      className="poppins-extralight bg-gradient-to-t from-second-color to-first-color min-h-screen overflow-hidden relative"
    >
      <NavBar />
      <ToastContainer />
      <div className="routes-margin">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hoops" element={<Hoops />} />
          <Route path="/hoops/:id" element={<Hoop />} />
          <Route path="/addhoop" element={<AddHoop />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
