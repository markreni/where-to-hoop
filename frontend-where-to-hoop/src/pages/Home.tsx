import { useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import { useLocationDispatch } from "../LocationContext.tsx";

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
    <div className="pt-20 h-screen flex items-center justify-center poppins-medium text-[min(8vw,2.0rem)] text-white text-center">
      Please enable location services for better experience with the web service.
    </div>
  );
};

export default Home;