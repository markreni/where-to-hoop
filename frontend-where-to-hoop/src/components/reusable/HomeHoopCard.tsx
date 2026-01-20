import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import type { FocusableElement } from "@react-types/shared";
import type { MouseEvent } from "react";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { HoopBadge } from "./HoopBadge.tsx";
import { HoopCardButton } from "./HoopCardButton.tsx";
import { useTranslation } from "../../hooks/useTranslation.ts";

interface HomeHoopCardProps {
  hoop: BasketballHoop;
  distance: number;
}

export const HomeHoopCard = ({ hoop, distance }: HomeHoopCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const imageSrc = hoop.profile_images.length > 0
    ? hoop.profile_images[0].imageName
    : "https://via.placeholder.com/300x200";

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(
      `Ready to play at hoop ${hoop.name} today at ${new Date().toISOString().split('T')[1]}`
    );
  };

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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HoopBadge
              variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
              text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
              iconSize={12}
              textClassName="responsive-hoopcard-elements-text"
            />
            <HoopBadge
              variant="condition"
              condition={hoop.condition}
              text={t(`common.${hoop.condition}`)}
              textClassName="responsive-hoopcard-elements-text"
            />
            <HoopBadge
              variant="players"
              text={t('hoops.players', { count: hoop.currentPlayers > 99 ? '>99' : hoop.currentPlayers })}
              textClassName="responsive-hoopcard-elements-text"
            />
          </div>
          <HoopCardButton
            actionFunction={readyToPlay}
            title={t('hoops.hoopcardReadyToPlayButton')}
            bgColor="bg-green-500/80 hover:bg-green-600"
          />
        </div>
      </div>
    </div>
  );
};
