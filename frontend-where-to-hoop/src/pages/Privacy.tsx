import { useColorModeValues } from "../contexts/DarkModeContext";
import { useTranslation } from "../hooks/useTranslation";
import type { ColorMode } from "../types/types";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Privacy = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className={`${colorModeContext} max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6 sm:p-8`}>
          <h1 className={`${colorModeContext} text-fluid-2xl poppins-bold background-text mb-4`}>
            {t('privacy.title')}
          </h1>

          <p className={`${colorModeContext} text-fluid-base background-text mb-8`}>
            {t('privacy.intro')}
          </p>

          <div className="flex flex-col gap-6">
            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.whatWeCollect')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.whatWeCollectText')}
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.howWeUse')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.howWeUseText')}
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.imagesLicensing')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.imagesLicensingText')}
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.locationData')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.locationDataText')}
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.dataRetention')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.dataRetentionText')}
              </p>
            </section>

            <section className={`${colorModeContext} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                {t('privacy.contact')}
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                {t('privacy.contactText')}{" "}
                <Link to="/contact" className="text-first-color hover:underline">{t('privacy.contactPage')}</Link>{" "}
                {t('privacy.orEmail')} <strong>contact@wherehoops.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
