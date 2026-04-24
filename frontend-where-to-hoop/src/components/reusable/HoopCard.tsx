import type { Dispatch } from "react";
import type { BasketballHoop, ColorMode, MapView, PlayerEnrollment } from "../../types/types.ts";
import { useLocationDispatch } from "../../contexts/LocationContext.tsx";
import { useColorModeValues } from "../../contexts/ColorModeContext.tsx";
import { useLanguage } from "../../contexts/LanguageContext.tsx";
import { useNavigate } from "react-router-dom";
import type { FocusableElement } from "@react-types/shared";
import { useMemo, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { HoopCardButton } from "./HoopCardButton.tsx";
import { HoopBadge } from "./HoopBadge.tsx";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";
import { useMediaQuery } from 'usehooks-ts'
import breakpoints from "../../assets/style.ts";
import { useTranslation } from "../../hooks/useTranslation.ts";
import { groupEnrollmentsByTime, shortenAddress } from "../../utils/functions.ts";
import { fetchActiveEnrollments, getHoopImageUrl } from "../../services/requests.ts";
import { useMapViewDispatch } from "../../contexts/MapViewContext.tsx";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { useFavorites } from "../../hooks/useFavorites.ts";
//import { Button } from "react-aria-components";

interface HoopCardProps {
  hoop: BasketballHoop;
  distance: number;
  playerEnrollments: PlayerEnrollment[];
}
const HoopCard = ({ hoop, distance, playerEnrollments }: HoopCardProps) => {
  const xsm = useMediaQuery(`(min-width: ${breakpoints.xsm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const language = useLanguage();
  const userLocationDispatch = useLocationDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapViewDispatch: Dispatch<MapView> = useMapViewDispatch();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

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
    navigate('/hoops');
  };

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
    e.preventDefault();
    e.stopPropagation();
    {/* `Let's hoopz at hoop ${hoop.name} today at ${new Date().toISOString().split('T')[1]}` */}
    navigate(`/hoops/${hoop.id}`);
  };

  const { playingNow } = useMemo(
    () => groupEnrollmentsByTime(playerEnrollments),
    [playerEnrollments]
  );
  const playingNowCount = playingNow.length;

  const { data: userActiveEnrollments = [] } = useQuery<PlayerEnrollment[]>({
    queryKey: ['activeEnrollments', user?.id],
    queryFn: () => fetchActiveEnrollments(user!.id),
    enabled: !!user,
  });
  const isCheckedIn = userActiveEnrollments.some(e => e.hoopId === hoop.id);

  return (
    <div className={`${colorModeContext} h-1/3 sm:h-full w-full xsm:w-5/6 sm:w-full flex flex-col justify-start gap-2 px-3 pt-2 pb-3 rounded-md bg-background background-text shadow-lg transition-shadow cursor-default`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <strong className="text-fluid-base">{hoop.name}</strong>
          <div className="flex items-center gap-x-4 gap-y-0 flex-wrap">
            <span className="text-fluid-xs font-extralight">{distance.toFixed(1)} km</span>
            <p className="text-fluid-xs">{hoop.address ? shortenAddress(hoop.address) : t("common.noAddress")}</p>
          </div>
        </div>
         {user && (
            isFavorited(hoop.id)
            ? <MdFavorite className="text-red-500 cursor-pointer transition-colors" size={26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
            : <MdOutlineFavoriteBorder className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" size={26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
          )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-start gap-4">
          <div className="relative w-full sm:w-2/3 shrink-0">
            <div className="absolute top-0.5 right-0.5 z-10">
              <HoopCardButton actionFunction={locateHoop} title={t('hoops.hoopcardMapButton')} colors="hoop-card-button-blue" text="text-fluid-sm"></HoopCardButton>
            </div>
            <img className="rounded-md w-full h-40 object-cover"
              src={hoop.images.length > 0 ? getHoopImageUrl(hoop.images[0].imagePath) : 'https://via.placeholder.com/150'}
              alt={hoop.name}
            />
            {isCheckedIn && (
              <span
                className="absolute top-0.5 left-0.5 inline-flex items-center text-fluid-xs font-semibold px-2 py-0.5 rounded-sm bg-green-500 text-white shadow-md ring-1 ring-white/30"
                title={t('hoops.hoopcardCheckedIn')}
              >
                {t('hoops.hoopcardCheckedIn')}
              </span>
            )}
          </div>
          <div className="flex-col gap-1 items-start justify-around hidden sm:flex">
            <p className="w-full font-thin responsive-hoopcard-elements-text">{hoop.description[language] || hoop.description.en || hoop.description.fi}</p>
            {playingNow.length > 0 && (
              <div className="flex items-center justify-start gap-x-2 gap-y-1 mt-1 flex-wrap">
                <span className="text-fluid-xs text-gray-500 dark:text-gray-400">
                  {t('hoops.hoopcardPlayingNow')}
                </span>
                <div className="flex -space-x-1.5">
                  {playingNow.slice(0, 5).map(enrollment => (
                    <div
                      key={enrollment.id}
                      className="w-6 h-6 rounded-full bg-first-color flex items-center justify-center text-white text-xs font-medium ring-2 ring-background"
                      title={enrollment.playerId ?? 'Deleted user'}
                    >
                      {enrollment.playerNickname.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {playingNow.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-background">
                      +{playingNow.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center gap-11.5">
          <div className="flex flex-col gap-1 flex-1 w-full xsm:w-auto">
            <div className="flex justify-start flex-wrap w-full [&>*]:flex-1 gap-1">
              <HoopBadge
                variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
                text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
                showIcon={false}
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
                showIcon={false}
                textClassName="responsive-hoopcard-elements-text"
                tooltip={t('hoops.tooltips.courtAccess')}
              />
              {hoop.isVerified && (
                <HoopBadge
                  variant="verified"
                  text={t('common.verified')}
                  showIcon={xsm}
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
          <div className="hidden sm:flex xmd:hidden xl:flex 2xl:hidden">
            <HoopCardButton actionFunction={readyToPlay} title={t('hoops.hoopcardReadyToPlayButton')} colors="hoop-card-button-green" text="text-fluid-lg"></HoopCardButton>
          </div>
        </div>
        <p className="sm:hidden font-thin responsive-hoopcard-elements-text">{hoop.description[language] || hoop.description.en || hoop.description.fi}</p>   
      </div>
      <div className="flex flex-col justify-between items-center sm:hidden xmd:flex xl:hidden 2xl:flex">
        <HoopCardButton actionFunction={readyToPlay} title={t('hoops.hoopcardReadyToPlayButton')} colors="hoop-card-button-green" text="text-fluid-xl"></HoopCardButton>
      </div>
    </div>                        
  );
}

export { HoopCard };