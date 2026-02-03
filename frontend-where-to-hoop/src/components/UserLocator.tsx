import { Button } from "react-aria-components";
import { MdOutlineMyLocation } from "react-icons/md";
import useLocateUser from "../hooks/useLocateUser.ts";
import { useEffect } from "react";
import { useLocationDispatch, useLocationValues } from "../contexts/LocationContext.tsx";
import { MdLocationDisabled } from "react-icons/md";
import type { ColorMode, Coordinates } from "../types/types.ts";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";


const UserLocator = ( { mapRef }: { mapRef: React.RefObject<L.Map | null> }) => {
  const locateUser = useLocateUser();
  const userLocationDispatch = useLocationDispatch();
  const mapCenterValues: Coordinates = useLocationValues();
  const colorModeContext: ColorMode = useColorModeValues();

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
      className={`${colorModeContext} background-text-reverse-black absolute top-37 right-[11px] z-400 text-3xl cursor-pointer drop-shadow-[0_1px_2px_gray]`}
        onPress={handleLocateUser}
        aria-label="Locate Me"
      >
        {mapCenterValues.latitude && mapCenterValues.longitude ? <MdOutlineMyLocation size={30}/> : <MdLocationDisabled size={30}/>}
    </Button>
  );
}

export { UserLocator };