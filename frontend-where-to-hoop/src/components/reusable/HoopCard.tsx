import type { BasketballHoop, ColorMode } from "../../types/types.ts";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { useNavigate } from "react-router-dom";
import type { FocusableElement } from "@react-types/shared";
import type { MouseEvent } from "react";
import { HoopCardButton } from "./HoopCardButton.tsx";
import { HoopBadge } from "./HoopBadge.tsx";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { useMediaQuery } from 'usehooks-ts'
import breakpoints from "../../assets/style.ts";
import { useTranslation } from "../../hooks/useTranslation.ts";

interface HoopCardProps {
  hoop: BasketballHoop;
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  distance: number;
}
const HoopCard = ({ hoop, toggleFunction, mapView, distance }: HoopCardProps) => {
  const xsm = useMediaQuery(`(min-width: ${breakpoints.xsm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const userLocationDispatch = useLocationDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const locateHoop = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    userLocationDispatch({
      type: 'SET_MAP_CENTER',
      payload: {
        coordinates: {
          latitude: hoop.coordinates.latitude,
          longitude: hoop.coordinates.longitude,
        },
        source: 'hoop',
      },
    });
    toggleFunction(!mapView);
  };

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    e.stopPropagation();
    {/* `Ready to play at hoop ${hoop.name} today at ${new Date().toISOString().split('T')[1]}` */}
    navigate(`/hoops/${hoop.id}`);
  };

  return (
    <div className={`${colorModeContext} h-1/3 sm:h-full w-full flex flex-col justify-start gap-3 p-4 rounded-md bg-background background-text shadow-lg transition-shadow cursor-default`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-start gap-2">
            <strong className="text-fluid-base">{hoop.name}</strong>
            <MdOutlineFavoriteBorder className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" size={23} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
          </div>
          <span className="text-fluid-sm">{distance.toFixed(1)} km</span>
        </div>
        <HoopCardButton actionFunction={locateHoop} title={t('hoops.hoopcardMapButton')} colors="hoop-card-button-blue"></HoopCardButton>
      </div>
      <div className="flex flex-col gap-3">
        <img className="rounded-md w-full h-40 object-cover"
          src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
          alt={hoop.name}
        />
        <div className="flex justify-between gap-2">
          <HoopBadge
            variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
            text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
            showIcon={xsm}
            textClassName="responsive-hoopcard-elements-text"
            tooltip={t('hoops.tooltips.courtType')}
          />
          <HoopBadge
            variant="condition"
            condition={hoop.condition}
            text={t(`common.condition.${hoop.condition}`)}
            textClassName="responsive-hoopcard-elements-text"
            tooltip={t('hoops.tooltips.condition')}
          />
          <HoopBadge
            variant="date"
            text={new Date(hoop.createdAt).toLocaleDateString(undefined, { year: "2-digit", month: "2-digit", day: "2-digit" })}
            showIcon={xsm}
            tooltip={t('hoops.tooltips.dateAdded')}
          />
          <HoopBadge
            variant="players"
            text={t('hoops.players', { count: hoop.playerEnrollments.length > 99 ? '>99' : hoop.playerEnrollments.length })}
            showIcon={true}
            textClassName="responsive-hoopcard-elements-text"
            tooltip={t('hoops.tooltips.currentPlayers')}
          />
        </div>
      </div>
      <div className="flex justify-between items-center gap-2">
        <p className="w-1/2 responsive-hoopcard-elements-text">{hoop.description}</p> 
        <HoopCardButton actionFunction={readyToPlay} title={t('hoops.hoopcardReadyToPlayButton')} colors="hoop-card-button-green" ></HoopCardButton>
      </div>
    </div>                        
  );
}

export { HoopCard };