import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { conditionColorSelector } from "../../utils/options.tsx";
import { IoSunnyOutline, IoHomeOutline } from "react-icons/io5";

interface HomeHoopCardProps {
  hoop: BasketballHoop;
  distance: number;
}

export const HomeHoopCard = ({ hoop, distance }: HomeHoopCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const imageSrc = hoop.profile_images.length > 0
    ? hoop.profile_images[0].imageName
    : "https://via.placeholder.com/300x200";

  return (
    <div className={`${colorModeContext} bg-background background-text rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer w-full h-full`}> 
      <div className="w-full h-40 sm:h-48 lg:h-56 bg-gray-100 dark:bg-gray-800">
        <img
          src={imageSrc}
          alt={hoop.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <strong className="text-fluid-sm line-clamp-1">{hoop.name}</strong>
          <span className={`${colorModeContext} text-fluid-xs background-text`}>{distance.toFixed(1)} km</span>
        </div>
        <div className="flex items-center gap-2">
          {hoop.isIndoor ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-fluid-xs">
              <IoHomeOutline size={12} /> Indoor
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-fluid-xs">
              <IoSunnyOutline size={12} /> Outdoor
            </span>
          )}
          <span className={`text-white text-fluid-xs px-2 py-0.5 rounded ${conditionColorSelector(hoop.condition)}`}>
            <span className="capitalize">{hoop.condition}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
