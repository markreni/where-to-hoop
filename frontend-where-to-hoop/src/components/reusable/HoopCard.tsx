import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { IoSunnyOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/courtCondition.tsx";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
//import { IoMapOutline } from "react-icons/io5";
import { Button } from "react-aria-components";
import type { FocusableElement } from "@react-types/shared";
import type { MouseEvent } from "react";
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
  return (
    <div className={`${colorModeContext} h-1/3 xmd:h-full w-full margin-b-for-page flex flex-col justify-start gap-2 bg-background rounded-md shadow-lg p-4 transition-shadow cursor-default dark:text-white`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <strong>{hoop.name}</strong>
          <span>{distance.toFixed(1)} km</span>
        </div>
        <Button 
          className={`${colorModeContext} flex items-center gap-2 px-5 py-1.5 border-1 border-black/20 shadow-md bg-blue-500/80 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm cursor-pointer dark:border-white/50`}
          onClick={(e) => locateHoop(e)}
        >
          {/*<IoMapOutline size={16} /> --- IGNORE ---*/}
          On Map
        </Button>
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
      <p className="w-full">{hoop.description}</p> 
    </div>                        
  );
}

export { HoopCard };