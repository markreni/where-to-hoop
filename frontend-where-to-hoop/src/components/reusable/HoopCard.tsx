import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { IoSunnyOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/courtCondition.tsx";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
//import { IoMapOutline } from "react-icons/io5";
import type { FocusableElement } from "@react-types/shared";
import type { MouseEvent } from "react";
import { HoopCardButton } from "./HoopCardButton.tsx";
//import { useMediaQuery } from 'usehooks-ts'
//import breakpoints from "../../assets/style.ts";


interface HoopCardProps {
  hoop: BasketballHoop;
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  distance: number;
}

const HoopCard = ({ hoop, toggleFunction, mapView, distance }: HoopCardProps) => {
  //const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const userLocationDispatch = useLocationDispatch();

  const locateHoop = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    userLocationDispatch({
      payload: {
        latitude: hoop.coordinates.latitude,
        longitude: hoop.coordinates.longitude,
      },
    });
    toggleFunction(!mapView);
  };

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    console.log(
      `Ready to play at hoop ${hoop.name} today at ${new Date().toISOString().split('T')[1]}`
    );
  };

  return (
    <div className={`${colorModeContext} h-1/3 xmd:h-full w-full flex flex-col justify-start gap-2 bg-background rounded-md shadow-lg p-4 transition-shadow cursor-default dark:text-white`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <strong>{hoop.name}</strong>
          <span>{distance.toFixed(1)} km</span>
        </div>
        <HoopCardButton actionFunction={locateHoop} title="On Map" bgColor="bg-blue-500/80 hover:bg-blue-600"></HoopCardButton>
      </div>
      <div className="flex justify-between gap-3">
        <div className="w-2/3">
          <img className="rounded-md w-full h-full object-cover"
            src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
            alt={hoop.name}
          />
        </div>
        <div className="w-1/4 flex flex-col justify-around">
            {hoop.indoor ? (
              <span className="hoop-card-icon bg-blue-100 text-blue-700">
                <IoHomeOutline size={14} />
                Indoor´
              </span>
              ) : (
              <span className="hoop-card-icon bg-amber-100 text-amber-700">
                <IoSunnyOutline size={14} />
                Outdoor
              </span>
            )}
          <div className={`hoop-card-icon text-white ${conditionColorSelector(hoop.condition)}`}>
            <span className="capitalize">{`${hoop.condition}`}</span> 
          </div>
          <div className="hoop-card-icon bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <MdOutlineDateRange size={14} />
            <span>{`${new Date(hoop.createdAt).toLocaleDateString()}`}</span>
            </div>
          </div>
      </div>
      <div className="flex justify-between items-center gap-2">
        <p className="w-1/2">{hoop.description}</p> 
        <HoopCardButton actionFunction={readyToPlay} title="Ready to play" bgColor="bg-green-500/80 hover:bg-green-600" ></HoopCardButton>
      </div>
    </div>                        
  );
}

export { HoopCard };