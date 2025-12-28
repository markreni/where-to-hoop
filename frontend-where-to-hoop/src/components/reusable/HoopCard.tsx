import type { BasketballHoop, ColorMode, Coordinates } from "../../types/types.ts";
import { IoSunnyOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/courtCondition.tsx";
import { useLocationValues } from "../../contexts/LocationContext.tsx";
import haversineDistance from "../../utils/functions.ts";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
//import { useMediaQuery } from 'usehooks-ts'
//import breakpoints from "../../assets/style.ts";


interface HoopCardProps {
  hoop: BasketballHoop;
}

const HoopCard = ({ hoop }: HoopCardProps) => {
  //const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const userLocationContext: Coordinates = useLocationValues();''

  const distance = haversineDistance([userLocationContext.latitude!, userLocationContext.longitude!], [hoop.coordinates.latitude!, hoop.coordinates.longitude!], false);

  return (
    <div className={`${colorModeContext} h-1/3 md:h-full w-full flex flex-col justify-start gap-2 bg-background rounded-md shadow-lg p-4 hover:shadow-xl hover:bg-gray-100/95 transition-shadow cursor-pointer dark:text-white dark:hover:bg-gray-800/95`}>
      <div className="flex justify-start gap-1">
        <strong>{hoop.name}</strong><br />
        <span>{distance.toFixed(1)} km</span>
      </div>
      <div className="flex justify-between gap-3">
        <div className="w-2/3">
          <img className="rounded-md w-full h-full object-cover"
            src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
            alt={hoop.name}
          />
        </div>
        <div className="w-1/3 flex flex-col justify-evenly gap-1">
            {hoop.indoor ? (
              <span className="hoop-card-icon bg-blue-100 text-blue-700">
                <IoHomeOutline size={14} />
                Indoor
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