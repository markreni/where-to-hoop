import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { HoopBadge } from "./HoopBadge.tsx";

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
          <HoopBadge
            variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
            text={hoop.isIndoor ? 'Indoor' : 'Outdoor'}
            iconSize={12}
          />
          <HoopBadge
            variant="condition"
            condition={hoop.condition}
            text={hoop.condition}
          />
        </div>
      </div>
    </div>
  );
};
