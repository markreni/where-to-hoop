import { useColorModeValues } from "../contexts/DarkModeContext";
import { useTranslation } from "../hooks/useTranslation";
import type { ColorMode } from "../types/types";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import { GiBasketballBall } from "react-icons/gi";
import { FaMapMarkerAlt, FaUsers, FaHandshake } from "react-icons/fa";

const About = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className={`${colorModeContext} max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6 sm:p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <GiBasketballBall size={40} className="text-first-color" />
            <h1 className={`${colorModeContext} text-fluid-2xl poppins-bold background-text`}>
              {t('about.title')}
            </h1>
          </div>

          <p className={`${colorModeContext} text-fluid-base background-text mb-6`}>
            {t('about.intro')}
          </p>

          <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-4`}>
            {t('about.whatYouCanDo')}
          </h2>

          <div className="flex flex-col gap-4 mb-8">
            <div className={`${colorModeContext} flex items-start gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
              <FaMapMarkerAlt size={24} className="text-first-color flex-shrink-0 mt-1" />
              <div>
                <p className={`${colorModeContext} font-medium background-text`}>{t('about.findCourts')}</p>
                <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
                  {t('about.findCourtsDesc')}
                </p>
              </div>
            </div>

            <div className={`${colorModeContext} flex items-start gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
              <FaUsers size={24} className="text-first-color flex-shrink-0 mt-1" />
              <div>
                <p className={`${colorModeContext} font-medium background-text`}>{t('about.letOthersKnow')}</p>
                <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
                  {t('about.letOthersKnowDesc')}
                </p>
              </div>
            </div>

            <div className={`${colorModeContext} flex items-start gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
              <FaHandshake size={24} className="text-first-color flex-shrink-0 mt-1" />
              <div>
                <p className={`${colorModeContext} font-medium background-text`}>{t('about.connectHoopers')}</p>
                <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
                  {t('about.connectHoopersDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className={`${colorModeContext} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
            <p className={`${colorModeContext} text-fluid-sm background-text`}>
              <strong>{t('about.tip')}</strong> {t('about.tipText')}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
