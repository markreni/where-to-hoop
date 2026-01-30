import { Button } from "react-aria-components";
import { MdOutlineMyLocation } from "react-icons/md";
import useLocateUser from "../hooks/useLocateUser.ts";
import { useEffect } from "react";
import { useLocationDispatch, useLocationValues } from "../contexts/LocationContext.tsx";
import { MdLocationDisabled } from "react-icons/md";
import type { Coordinates } from "../types/types.ts";


const UserLocator = ( { mapRef }: { mapRef: React.RefObject<L.Map | null> }) => {
  const locateUser = useLocateUser();
  const userLocationDispatch = useLocationDispatch();
  const mapCenterValues: Coordinates = useLocationValues();

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
      className="absolute top-19 right-[10px] text-gray-700 text-3xl z-400 cursor-pointer" 
        onPress={handleLocateUser}
        aria-label="Locate Me"
      >
        {mapCenterValues.latitude && mapCenterValues.longitude ? <MdOutlineMyLocation /> : <MdLocationDisabled />}
    </Button>
  );
}

export { UserLocator };