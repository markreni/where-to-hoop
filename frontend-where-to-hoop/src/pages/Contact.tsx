import { useColorModeValues } from "../contexts/DarkModeContext";
import { useTranslation } from "../hooks/useTranslation";
import type { ColorMode } from "../types/types";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import { MdEmail } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

const Contact = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className={`${colorModeContext} max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6 sm:p-8`}>
          <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text mb-6`}>
            {t('contact.title')}
          </h1>

          <p className={`${colorModeContext} text-fluid-base background-text mb-8`}>
            {t('contact.intro')}
          </p>

          <div className="flex flex-col gap-4">
            <a
              href="mailto:contact@wherehoops.com"
              className={`${colorModeContext} flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 background-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <MdEmail size={24} className="text-first-color" />
              <div>
                <p className="font-medium">{t('contact.email')}</p>
                <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>contact@wherehoops.com</p>
              </div>
            </a>

            <a
              href="https://github.com/markreni/where-to-hoop"
              target="_blank"
              rel="noopener noreferrer"
              className={`${colorModeContext} flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 background-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <FaGithub size={24} className="text-first-color" />
              <div>
                <p className="font-medium">{t('contact.github')}</p>
                <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>{t('contact.githubDesc')}</p>
              </div>
            </a>
          </div>

          <div className={`${colorModeContext} mt-8 p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
            <h2 className={`${colorModeContext} text-fluid-lg poppins-medium background-text mb-2`}>
              {t('contact.suggestCourt')}
            </h2>
            <p className={`${colorModeContext} text-fluid-sm background-text`}>
              {t('contact.suggestCourtText')}{" "}
              <a href="/addhoop" className="text-first-color hover:underline">{t('contact.addHoopFeature')}</a>{" "}
              {t('contact.toAddIt')}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
