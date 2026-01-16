import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/options.tsx";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
//import { IoMapOutline } from "react-icons/io5";
import type { FocusableElement } from "@react-types/shared";
import type { MouseEvent } from "react";
import { HoopCardButton } from "./HoopCardButton.tsx";
import { IoSunnyOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { useMediaQuery } from 'usehooks-ts'
import breakpoints from "../../assets/style.ts";


interface HoopCardProps {
  hoop: Omit<BasketballHoop, "id">;
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  distance: number;
}

const HoopCard = ({ hoop, toggleFunction, mapView, distance }: HoopCardProps) => {
  const xsm = useMediaQuery(`(min-width: ${breakpoints.xsm})`);
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
    <div className={`${colorModeContext} h-1/3 sm:h-full w-full flex flex-col justify-start gap-3 p-4 rounded-md bg-background background-text shadow-lg transition-shadow cursor-default`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-start gap-2">
            <strong className="text-fluid-base">{hoop.name}</strong>
            <MdOutlineFavoriteBorder size={23} aria-label="Add to favorites"/>
          </div>
          <span className="text-fluid-sm">{distance.toFixed(1)} km</span>
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
          {hoop.isIndoor ? (
            <span className="hoop-card-icon bg-blue-100 text-blue-700">
              {xsm && <IoHomeOutline size={14} />}
              <span className="responsive-hoopcard-elements-text">Indoor</span>
            </span>
            ) : (
            <span className="hoop-card-icon bg-amber-100 text-amber-700">
              {xsm && <IoSunnyOutline size={14} />}
              <span className="responsive-hoopcard-elements-text">Outdoor</span>
            </span>
            )}
          <div className={`hoop-card-icon text-white ${conditionColorSelector(hoop.condition)}`}>
            <span className="responsive-hoopcard-elements-text capitalize">{`${hoop.condition}`}</span> 
          </div>
          <div className="hoop-card-icon bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {xsm && <MdOutlineDateRange size={14} />}
            <span className="text-fluid-xs">{`${new Date(hoop.createdAt).toLocaleDateString(undefined, { year: "2-digit", month: "2-digit", day: "2-digit" })}`}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center gap-2">
        <p className="w-1/2 responsive-hoopcard-elements-text">{hoop.description}</p> 
        <HoopCardButton actionFunction={readyToPlay} title="Ready to play" bgColor="bg-green-500/80 hover:bg-green-600" ></HoopCardButton>
      </div>
    </div>                        
  );
}

export { HoopCard };