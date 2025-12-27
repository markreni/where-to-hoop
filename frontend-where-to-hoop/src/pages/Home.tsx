import { useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import { useLocationDispatch } from "../contexts/LocationContext.tsx";
import Footer from "../components/Footer.tsx";

const Home = () => {
  //const navigate = useNavigate();
  const dispatch = useLocationDispatch();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position => {
      dispatch({
        payload: {
          latitude: position ? position.coords.latitude : null,
          longitude: position ? position.coords.longitude : null,
        },
      });
        console.log("User's current position:", position.coords);
        //setTimeout(() => navigate("/hoops"), 1000);
    }), error => {
      /* implement toaster or react aria*/
      console.error("Error getting user's location:", error);
    }), { enableHighAccuracy: true };
    
  }, []);

  return (
    <div className="pt-20 h-screen flex flex-col justify-center poppins-medium text-[min(8vw,2.0rem)] text-white text-center">
      <div className="flex-grow space-y-6 px-4">
        <section>
          Welcome to <strong>WhereHoops</strong>!<br />
          Find basketball hoops near you.<br />
        </section>
        <section> 
          Please enable location services for better experience with the web service.
        </section>
      </div>
      <Footer />
      
    </div>
  );
};

export default Home;