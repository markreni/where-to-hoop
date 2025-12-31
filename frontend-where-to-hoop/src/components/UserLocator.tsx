import { Button } from "react-aria-components";
import { MdOutlineMyLocation } from "react-icons/md";
import { useLocationValues, useLocationDispatch } from "../contexts/LocationContext.tsx";
import type { Coordinates } from "../types/types.ts";
import { useEffect } from "react";


const UserLocator = ( { mapRef }: { mapRef: React.RefObject<L.Map | null> }) => {
  const userLocationDispatch = useLocationDispatch();
  const userLocationContext: Coordinates = useLocationValues();
  
  useEffect(() => {
    {/* Automatically watch user's location and update context 
    const watchId = navigator.geolocation.watchPosition((position) => {
        userLocationDispatch({
          payload: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
    });

    return () => navigator.geolocation.clearWatch(watchId);
    */}
  }, [userLocationDispatch]);

  const locateUser = () => {
      console.log("Locating user...");
      navigator.geolocation.getCurrentPosition((position) => {
        userLocationDispatch({
          payload: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        mapRef.current?.setView([position.coords.latitude, position.coords.longitude], 13);
        // mapRef.current?.flyTo([userLocationContext.latitude, userLocationContext.longitude], 13);
      }, (error) => {
        console.error("Error getting user's location:", error);
      }, { enableHighAccuracy: true });
  };

  return (
    <Button 
        className="absolute bottom-27 right-[13px] text-gray-700 text-3xl z-400 cursor-pointer" 
            onPress={locateUser}
            aria-label="Locate Me"
          >
            <MdOutlineMyLocation />
    </Button>
  );
}

export { UserLocator };