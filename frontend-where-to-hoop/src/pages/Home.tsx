import { useEffect, useMemo } from "react";
import Footer from "../components/Footer.tsx";
import { HomeHoopCard } from "../components/reusable/HomeHoopCard.tsx";
import { Carousel } from "../components/reusable/Carousel.tsx";
import initialHoops from "../mockhoops.tsx";
import { useLocationValues } from "../contexts/LocationContext.tsx";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { BasketballHoop, ColorMode } from "../types/types.ts";
import haversineDistance from "../utils/functions.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
import baskethoopImg from "../images/baskethoop.png";

const Home = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const mapCenterValues = useLocationValues();
  const locateUser = useLocateUser();

  useEffect(() => {
      locateUser();
    }, [locateUser]);

  // Sort hoops by distance from user
  const sortedHoopsWithDistance: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
    if (!mapCenterValues.latitude || !mapCenterValues.longitude) {
      return initialHoops.map(hoop => ({ hoop, distance: 0 }));
    }

    return initialHoops
      .map(hoop => ({
        hoop,
        distance: haversineDistance(
          [mapCenterValues.latitude!, mapCenterValues.longitude!],
          [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [mapCenterValues.latitude, mapCenterValues.longitude]);

  return (
    <div className={`${colorModeContext} padding-for-nav-bar min-h-screen flex flex-col from-second-color to-first-color transition-colors relative overflow-hidden`}>
      {/* Background hoop image */}
      <img
        src={baskethoopImg}
        alt=""
        aria-hidden="true"
        className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-2xl opacity-6 pointer-events-none select-none"
      />
      <div className="flex-grow flex flex-col justify-center px-4 sm:px-16 py-8 max-w-4xl mx-auto w-full relative z-10">
        <div className="space-y-10">
          <h1 className={`${colorModeContext} poppins-bold text-3xl sm:text-4xl md:text-5xl background-text-reverse-black mb-8 text-center`}>
            Nearest Courts
          </h1>

          {(mapCenterValues.latitude && mapCenterValues.longitude) ? (
            <Carousel>
              {sortedHoopsWithDistance.map(({ hoop, distance }) => (
                <HomeHoopCard key={hoop.id} hoop={hoop} distance={distance} />
              ))}
            </Carousel>
          ) : (
            <div className="text-center background-text text-lg">
              <p>Enable location access to see the nearest courts</p>
            </div>
          )}

          <h1 className={`${colorModeContext} poppins-bold text-3xl sm:text-4xl md:text-5xl background-text-reverse-black mb-8 text-center`}>
            Most Active Courts
          </h1>
          <Carousel>
            {sortedHoopsWithDistance.map(({ hoop, distance }) => (
              <HomeHoopCard key={hoop.id} hoop={hoop} distance={distance} />
            ))}
          </Carousel>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
