import type { BasketballHoop, ColorMode, Coordinates } from "../../types/types.ts";
import { IoLocationSharp } from "react-icons/io5";
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
      <div className="flex justify-start gap-4">
        <div className="w-2/3">
          <img className="rounded-md w-full h-full object-cover"
            src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
            alt={hoop.name}
          />
        </div>
        <div className="flex flex-col justify-evenly text-sm">
          <div className="hoop-card-spacer">
            <IoLocationSharp size={14}/>
            <p> {hoop.indoor ? "Indoor" : "Outdoor"}</p>
          </div>
          <div className="hoop-card-spacer">
            <div className={`w-3 h-3 rounded-full ${conditionColorSelector(hoop.condition)}`} title={hoop.condition} />
            <span className="capitalize">{`${hoop.condition}`}</span> 
          </div>
          <div className="hoop-card-spacer">
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