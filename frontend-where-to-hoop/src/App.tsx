import {
  Routes,
  Route,
  //Link,
  //Navigate,
  //useParams,
  //useNavigate,
  //useMatch,
} from "react-router-dom";
import NavBar from './components/NavBar.tsx';
import Hoops from './pages/Hoops.tsx';
import AddHoop from './pages/AddHoop.tsx';
import Home from './pages/Home.tsx';


function App() {

  return (
    <div 
      className="poppins-extralight bg-gradient-to-t from-second-color to-first-color h-screen w-screen overflow-hidden relative"
    >
      <NavBar />
      <div className="routes-margin">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hoops" element={<Hoops />} />
          <Route path="/addhoop" element={<AddHoop />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
