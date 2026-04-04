import type { BasketballHoop, ColorMode, MapView, PlayerEnrollment } from "../../types/types.ts";
import type { FocusableElement } from "@react-types/shared";
import { useMemo, type Dispatch, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useColorModeValues } from "../../contexts/ColorModeContext.tsx";
import { HoopBadge } from "./HoopBadge.tsx";
import { HoopCardButton } from "./HoopCardButton.tsx";
import { useTranslation } from "../../hooks/useTranslation.ts";
import { groupEnrollmentsByTime } from "../../utils/functions.ts";
import { getHoopImageUrl } from "../../services/requests.ts";
//import breakpoints from "../../assets/style.ts";
//import { useMediaQuery } from "usehooks-ts";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useMapViewDispatch } from "../../contexts/MapViewContext.tsx";

interface HomeHoopCardProps {
  hoop: BasketballHoop;
  distance: number;
  playerEnrollments: PlayerEnrollment[];
}

export const HomeHoopCard = ({ hoop, distance, playerEnrollments }: HomeHoopCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const userLocationDispatch = useLocationDispatch();
  const navigate = useNavigate();
  const mapViewDispatch: Dispatch<MapView> = useMapViewDispatch();
  const imageSrc = hoop.images.length > 0 ? getHoopImageUrl(hoop.images[0].imagePath) : 'https://via.placeholder.com/300x200';
  //const xsm: boolean = useMediaQuery(`(min-width: ${breakpoints.xsm})`);

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/hoops/${hoop.id}`);
  };

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
    mapViewDispatch('map');
    navigate(`/hoops/`);
  };

  const { playingNow } = useMemo(
    () => groupEnrollmentsByTime(playerEnrollments),
    [playerEnrollments]
  )
  const playingNowCount = playingNow.length

  return (
    <div className={`${colorModeContext} bg-background background-text rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg w-full flex-grow-0`}> 
      <div className="relative w-full h-44 xsm:h-52 sm:h-60 md:h-68 lg:h-76 bg-gray-100 dark:bg-gray-800">
        <div className="absolute top-2 right-2 z-10 mt-auto">
          <HoopCardButton actionFunction={locateHoop} title={t('hoops.hoopcardMapButton')} colors="hoop-card-button-blue" text="text-fluid-base" />
        </div>
        <img
          src={imageSrc}
          alt={hoop.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-x-7 gap-y-0 flex-wrap">
          <div className="flex items-center gap-5">
            <strong className="text-fluid-sm line-clamp-1">{hoop.name}</strong>
            <span className={`${colorModeContext} text-fluid-xs background-text`}>{distance.toFixed(1)} km</span>
          </div>
          <span className={`${colorModeContext} text-fluid-xs background-text pr-2 xsm:pr-7`}>{t(`${hoop.address??"No address is specified"}`)}</span>
        </div>
        <div className="flex flex-col xsm:flex-row items-start xsm:items-center justify-between gap-3">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <HoopBadge
                variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
                text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
                iconSize={12}
                showIcon={true} //showIcon={xsm}
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
                variant={hoop.isPaid ? 'paid' : 'free'}
                text={hoop.isPaid ? t('common.paid') : t('common.free')}
                showIcon={true}
                textClassName="responsive-hoopcard-elements-text"
                tooltip={t('hoops.tooltips.courtAccess')}
              />
              {hoop.isVerified && (
                <HoopBadge
                  variant="verified"
                  text={t('common.verified')}
                  showIcon={true}
                  textClassName="responsive-hoopcard-elements-text"
                  tooltip={t('hoops.tooltips.verified')}
                />
              )}
            </div>
            <HoopBadge
              variant="players"
              text={
                playingNowCount === 1
                ? t('hoops.players.one')
                : t('hoops.players.other', { count: playingNowCount > 99 ? '>99' : playingNowCount })
              }
              showIcon={true}
              textClassName="responsive-hoopcard-elements-text"
              tooltip={t('hoops.tooltips.currentPlayers')}
              capitalize={false}
            />
          </div>
          <div className="hidden xsm:flex">
          <HoopCardButton
            actionFunction={readyToPlay}
            title={t('hoops.hoopcardReadyToPlayButton')}
            colors="hoop-card-button-green"
            text="text-fluid-base"
          />
          </div>
        </div>
        <div className="flex xsm:hidden justify-center">
          <HoopCardButton
              actionFunction={readyToPlay}
              title={t('hoops.hoopcardReadyToPlayButton')}
              colors="hoop-card-button-green"
              text="text-fluid-lg"
            />
        </div>
      </div>
    </div>
  );
};
