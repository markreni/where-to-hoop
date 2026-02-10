import { useEffect, useMemo, useRef, type Dispatch } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import { HomeHoopCard } from "../components/reusable/HomeHoopCard.tsx";
import { Carousel } from "../components/reusable/Carousel.tsx";
import { WeatherWidget } from "../components/reusable/WeatherWidget.tsx";
import { useLocationValues } from "../contexts/LocationContext.tsx";
import { useColorModeValues } from "../contexts/ColorModeContext.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import { useWeather, isWarmWeather, isRainyWeather, isSnowyWeather, isGoodWeatherForBasketball } from "../hooks/useWeather.ts";
import type { BasketballHoop, ColorMode, MapView } from "../types/types.ts";
import haversineDistance from "../utils/functions.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
//import baskethoopImg from "../images/baskethoop.png";
import { MdLocationPin, MdArrowForward } from "react-icons/md";
import { InteractiveBasketball } from "../components/reusable/InteractiveBasketball.tsx";
import { useMapViewDispatch } from "../contexts/MapViewContext.tsx";

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
  }, [mapCenterValues.latitude, mapCenterValues.longitude]);

  const sortedHoopsWithPlayers: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
    return hoops
      .map(hoop => ({
        hoop,
        distance: haversineDistance(
          [mapCenterValues.latitude!, mapCenterValues.longitude!],
          [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
        ),
        players: hoop.playerEnrollments.length,
      }))
      .sort((a, b) => b.players - a.players);
  }, []);

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
        <section className="text-center py-8 sm:py-12">

          <h1 className={`${colorModeContext} poppins-bold text-fluid-4xl background-text-reverse-black mb-4`}>
            {t('home.intro.welcomePrefix')} <span className={`${colorModeContext} background-text-black text-stroke-adaptive`}>{t('home.intro.wherehoops')}</span>
          </h1>
          <p className={`${colorModeContext} text-fluid-lg background-text max-w-2xl mx-auto mb-3`}>
            {t('home.intro.description')}
          </p>
          <p className={`${colorModeContext} text-fluid-lg background-text max-w-2xl mx-auto mb-8`}>
            {t('home.intro.description2')}
          </p>

          {/* About Link */}
          <Link to="/about" className={`${colorModeContext} inline-flex items-center gap-1 background-text-reverse-black font-small text-fluid-sm hover:underline transition-colors mb-8`}>
            <MdArrowForward size={16} />
            {t('home.intro.aboutLink')}
          </Link>

          {/* Hero Section */}
          <div className="text-center">
    
            <p className={`${colorModeContext} text-fluid-lg background-text max-w-xl mx-auto mb-8`}>
              {t('home.hero.subtitle')}
            </p>

            <Link to="/hoops">
              <button onClick={() => { mapViewDispatch('map') }} 
                  className={`${colorModeContext} inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 shadow-2xl border-white dark:border-black bg-first-color main-color-hover first-color-text font-medium transition-all hover:scale-105`}>
                <MdLocationPin size={24}/>
                {t('home.hero.ctaButton')}
              </button>
            </Link>
          </div>
        </section>

        <div className="space-y-10">
          <h1 className={`${colorModeContext} poppins-bold text-fluid-3xl background-text-reverse-black mb-8 text-center`}>
            {t('home.nearestCourts')}
          </h1>

          {(mapCenterValues.latitude && mapCenterValues.longitude) ? (
            <Carousel>
              {sortedHoopsWithDistance.map(({ hoop, distance }) => (
                <HomeHoopCard key={hoop.id} hoop={hoop} distance={distance} />
              ))}
            </Carousel>
          ) : (
            <div className="text-center background-text text-fluid-base">
              <p>{t('home.enableLocation')}</p>
            </div>
          )}

          <h1 className={`${colorModeContext} poppins-bold text-fluid-3xl background-text-reverse-black mb-8 text-center`}>
            {t('home.mostActiveCourts')}
          </h1>
          <Carousel>
            {sortedHoopsWithPlayers.map(({ hoop, distance}) => (
              <HomeHoopCard key={hoop.id} hoop={hoop} distance={distance} />
            ))}
          </Carousel>
        </div>

        {/* Encouragement Section */}
          <section ref={encouragementRef} className={`${colorModeContext} relative mt-12 p-6 rounded-xl bg-gray-100 dark:bg-black text-center overflow-hidden`}>
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
          </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
