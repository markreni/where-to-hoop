import { Button } from "react-aria-components";
import { MdOutlineMyLocation } from "react-icons/md";
import useLocateUser from "../hooks/useLocateUser.ts";
import { useEffect } from "react";
import { useLocationDispatch } from "../contexts/LocationContext.tsx";


const UserLocator = ( { mapRef }: { mapRef: React.RefObject<L.Map | null> }) => {
  const locateUser = useLocateUser();
  const userLocationDispatch = useLocationDispatch();

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

  const handleLocateUser = () => {
    locateUser({ mapRef, zoom: 13 });
  };

  return (
    <Button 
      className="absolute bottom-27 right-[13px] text-gray-700 text-3xl z-400 cursor-pointer" 
        onPress={handleLocateUser}
        aria-label="Locate Me"
      >
      <MdOutlineMyLocation />
    </Button>
  );
}

export { UserLocator };