import { useEffect, useMemo, useRef, type Dispatch } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import { HomeHoopCard } from "../components/reusable/HomeHoopCard.tsx";
import { Carousel } from "../components/reusable/Carousel.tsx";
import { WeatherWidget } from "../components/reusable/WeatherWidget.tsx";
import { useLocationValues } from "../contexts/LocationContext.tsx";
import { useColorModeValues } from "../contexts/ColorModeContext.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import { useWeather, isWarmWeather, isRainyWeather, isSnowyWeather, isGoodWeatherForBasketball } from "../hooks/useWeather.ts";
import type { BasketballHoop, ColorMode, MapView, PlayerEnrollment } from "../types/types.ts";
import haversineDistance, { groupEnrollmentsByTime, groupEnrollmentsByHoop } from "../utils/functions.ts";
import { fetchAllEnrollments } from "../services/requests.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
import useEnrollmentsRealtime from "../hooks/useEnrollmentsRealtime.ts";
//import baskethoopImg from "../images/baskethoop.png";
// @ts-expect-error -- MdPhoneIphone, MdPhoneAndroid, MdConstruction temporarily unused while mobile notice is commented out
import { MdLocationPin, MdArrowForward, MdPhoneIphone, MdPhoneAndroid, MdConstruction } from "react-icons/md";
import { InteractiveBasketball } from "../components/reusable/InteractiveBasketball.tsx";
import { useMapViewDispatch } from "../contexts/MapViewContext.tsx";
import { Button } from "react-aria-components";

const getRoundedSide = (index: number, total: number): 'left' | 'right' | 'both' | 'none' => {
  if (total === 1) return 'both';
  if (index === 0) return 'left';
  if (index === total - 1) return 'right';
  return 'none';
};

const Home = ({ hoops }: { hoops: BasketballHoop[] }) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const mapCenterValues = useLocationValues();
  const locateUser = useLocateUser();
  const { t } = useTranslation();
  const weather = useWeather();
  const mapViewDispatch: Dispatch<MapView> = useMapViewDispatch();
  const encouragementRef = useRef<HTMLElement>(null);

  useEffect(() => {
      locateUser();
    }, [locateUser]);

  const { data: allEnrollments = [] } = useQuery<PlayerEnrollment[]>({
    queryKey: ['enrollments'],
    queryFn: fetchAllEnrollments,
  })

  // Get weather-appropriate encouragement message
  const getEncouragementMessage = () => {
    if (weather.status !== 'success' || !weather.data) {
      return t('home.encouragement.default');
    }

    if (isRainyWeather(weather.data)) {
      return t('home.encouragement.rainy');
    }
    if (isSnowyWeather(weather.data)) {
      return t('home.encouragement.snowy');
    }
    if (isWarmWeather(weather.data)) {
      return t('home.encouragement.warm');
    }
    if (isGoodWeatherForBasketball(weather.data)) {
      return t('home.encouragement.nice');
    }
    if (weather.data.temperature < 10) {
      return t('home.encouragement.cold');
    }
    return t('home.encouragement.default');
  };

  // Sort hoops by distance from user
  const sortedHoopsWithDistance: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
    if (!mapCenterValues.latitude || !mapCenterValues.longitude) {
      return hoops.map(hoop => ({ hoop, distance: 0 }));
    }

    return hoops
      .map(hoop => ({
        hoop,
        distance: haversineDistance(
          [mapCenterValues.latitude!, mapCenterValues.longitude!],
          [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [mapCenterValues.latitude, mapCenterValues.longitude, hoops]);

  const enrollmentsByHoop = useMemo(() => groupEnrollmentsByHoop(allEnrollments), [allEnrollments])
  useEnrollmentsRealtime()

  const sortedHoopsWithPlayers: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
    return hoops
      .map(hoop => {
        const hoopEnrollments = enrollmentsByHoop.get(hoop.id) ?? []
        const { playingNow } = groupEnrollmentsByTime(hoopEnrollments)
        return {
          hoop,
          distance: haversineDistance(
            [mapCenterValues.latitude!, mapCenterValues.longitude!],
            [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
          ),
          players: playingNow.length,
        }
      })
      .sort((a, b) => b.players - a.players);
  }, [hoops, enrollmentsByHoop, mapCenterValues.latitude, mapCenterValues.longitude]);

  return (
    <div className={`${colorModeContext} padding-for-nav-bar min-h-screen flex flex-col from-second-color to-first-color transition-colors relative overflow-hidden`}>
      {/* Background hoop image */}
      {/*<img
        src={baskethoopImg}
        alt=""
        aria-hidden="true"
        className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-2xl opacity-6 pointer-events-none select-none"
      />
      */}
      <div className="flex-grow flex flex-col gap-10 justify-center px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full relative z-10">
        {/* Intro Section */}
        <section className="flex flex-col items-center pt-8 sm:pt-12">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className={`${colorModeContext} poppins-bold text-fluid-4xl background-text-reverse-black`}>
              {t('home.intro.welcomePrefix')} <span className={`${colorModeContext} background-text-black text-stroke-adaptive`}>{t('home.intro.wherehoops')}</span>
            </h1>
            <p className={`${colorModeContext} text-fluid-sm background-text-reverse-black opacity-75`}>
                {t('home.intro.helsinkiMade')}
            </p>
          </div>
        
          <div className="flex flex-col items-center gap-1 gap-3 mb-8">
            <p className={`${colorModeContext} text-fluid-lg background-text text-center max-w-2xl mx-auto`}>
              {t('home.intro.description')}
            </p>
            <p className={`${colorModeContext} text-fluid-lg background-text text-center max-w-2xl mx-auto`}>
              {t('home.intro.description2')}
            </p>
          </div>

          {/* About Link */}
          <Link to="/about" className={`${colorModeContext} inline-flex items-center gap-1 background-text-reverse-black font-small text-fluid-sm hover:underline transition-colors`}>
            {t('home.intro.aboutLink')}
            <MdArrowForward size={16} />
          </Link>

          {/* Mobile Notice 
          <span className={`${colorModeContext} mt-2 inline-flex items-center gap-1.5 text-fluid-xs background-text-reverse-black opacity-75 italic mb-9`}>
            <span className="flex gap-0">
              <MdPhoneIphone size={25} />
              <MdPhoneAndroid size={25} />
            </span>
            {t('home.intro.mobileNotice')}
            <MdConstruction size={23} />
          </span>
          */}
        </section>

        {/* Hero Section */}
        <section className="flex flex-col items-center gap-8">
          <div className={`${colorModeContext} text-fluid-lg background-text text-center max-w-xl mx-auto`}>
            <p>{t('home.hero.subtitle')}</p>
            <p>{t('home.hero.subtitle2')}</p>
          </div>

          <span className={`${colorModeContext} inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-center dark:bg-gray-900 border border-first-color/40 text-first-color text-fluid-sm font-medium`}>
            <MdLocationPin size={14} />
            {t('home.intro.helsinkiNotice')}
          </span>

          <Link to="/hoops">
            <Button onPress={() => { mapViewDispatch('map') }} 
              className={`${colorModeContext} inline-flex items-center gap-2 px-6 py-3 rounded-lg w-max border-2 shadow-2xl border-white dark:border-black bg-first-color main-color-hover first-color-text font-medium transition-all hover:scale-105`}>
              <MdLocationPin size={24}/>
              {t('home.hero.ctaButton')}
            </Button>
          </Link>
        </section>

        <section className="space-y-10 w-full">
          <h1 className={`${colorModeContext} poppins-bold text-fluid-3xl background-text-reverse-black mb-6 text-center`}>
            {t('home.nearestCourts')}
          </h1>

          {(mapCenterValues.latitude && mapCenterValues.longitude) ? (
            <Carousel>
              {sortedHoopsWithDistance.map(({ hoop, distance }, index, arr) => (
                <HomeHoopCard
                  key={hoop.id}
                  hoop={hoop}
                  distance={distance}
                  playerEnrollments={enrollmentsByHoop.get(hoop.id) ?? []}
                  roundedSide={getRoundedSide(index, arr.length)}
                />
              ))}
            </Carousel>
          ) : (
            <div className={`${colorModeContext} text-center background-text text-fluid-base`}>
              <p>{t('home.enableLocation')}</p>
            </div>
          )}

          <h1 className={`${colorModeContext} poppins-bold text-fluid-3xl background-text-reverse-black mb-6 text-center`}>
            {t('home.mostActiveCourts')}
          </h1>
          <Carousel>
            {sortedHoopsWithPlayers.map(({ hoop, distance}, index, arr) => (
              <HomeHoopCard
                key={hoop.id}
                hoop={hoop}
                distance={distance}
                playerEnrollments={enrollmentsByHoop.get(hoop.id) ?? []}
                roundedSide={getRoundedSide(index, arr.length)}
              />
            ))}
          </Carousel>
        </section>

        {/* Encouragement Section */}
          <section ref={encouragementRef} className={`${colorModeContext} relative mt-10 p-6 rounded-xl bg-gray-100 dark:bg-black text-center overflow-hidden`}>
            {/* Weather widget - right corner on larger screens */}
            <div className="hidden sm:block sm:absolute sm:top-4 sm:right-4">
              <WeatherWidget />
            </div>

            <div className="flex justify-center mb-4">
              <InteractiveBasketball size={40} className="text-first-color" boundsRef={encouragementRef} />
            </div>
            <h2 className={`${colorModeContext} poppins-bold text-fluid-2xl text-first-color mb-4`}>
              {t('home.encouragement.title')}
            </h2>

            {/* Weather widget - under title on smaller screens */}
            <div className="sm:hidden flex justify-center mb-4">
              <WeatherWidget />
            </div>

            <p className={`${colorModeContext} text-fluid-base background-text mb-4 max-w-lg mx-auto`}>
              {getEncouragementMessage()}
            </p>
            <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto`}>
              {t('home.encouragement.callToAction')}{' '}
              <span className={`${colorModeContext} inline-flex items-center gap-1 px-2 py-1 rounded bg-green-400/30 dark:text-green-500 font-medium`}>
                {t('home.encouragement.readyToPlayButton')}
              </span>{' '}
              {t('home.encouragement.onAnyCourtCard')}
            </p>
            <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mt-2`}>
              {t('home.encouragement.checkInFollowUp')}{' '}
              <span className={`${colorModeContext} inline-flex items-center gap-1 px-2 py-1 rounded bg-first-color/20 text-first-color font-medium`}>
                {t('home.encouragement.checkInButton')}
              </span>{' '}
              {t('home.encouragement.toConfirm')}
            </p>
          </section>
        </div>
      <Footer />
    </div>
  );
};

export default Home;
