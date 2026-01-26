import { Link } from "react-router-dom"
import { useColorModeValues } from "../contexts/DarkModeContext"
import { useTranslation } from "../hooks/useTranslation"
import type { ColorMode } from "../types/types"
import { BackArrow } from "../components/reusable/BackArrow"
import { FAQItem } from "../components/reusable/FAQItem"
import { ConditionCard } from "../components/reusable/ConditionCard"
import Footer from "../components/Footer"
import { FaQuestionCircle, FaCamera, FaPlusCircle, FaPlayCircle } from "react-icons/fa"

const Info = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className={`${colorModeContext} max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6 sm:p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <FaQuestionCircle size={36} className="text-first-color" />
            <h1 className={`${colorModeContext} text-fluid-2xl poppins-bold background-text`}>
              {t('faq.title')}
            </h1>
          </div>

          <p className={`${colorModeContext} text-fluid-base background-text mb-8`}>
            {t('faq.intro')}
          </p>

          {/* FAQ Section */}
          <div className="flex flex-col gap-4 mb-8">
            <FAQItem
              question={t('faq.readyToPlay.question')}
              answer={t('faq.readyToPlay.answer')}
              icon={<FaPlayCircle size={24} />}
            />

            <FAQItem
              question={t('faq.addCourt.question')}
              answer={t('faq.addCourt.answer')}
              icon={<FaPlusCircle size={24} />}
            />

            <FAQItem
              question={t('faq.takePhoto.question')}
              answer={t('faq.takePhoto.answer')}
              icon={<FaCamera size={24} />}
            />
          </div>

          {/* Condition Guidelines */}
          <div className="mb-8">
            <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
              {t('faq.conditionTitle')}
            </h2>
            <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400 mb-4`}>
              {t('faq.conditionIntro')}
            </p>

            <div className="flex flex-col gap-3">
              <ConditionCard
                title={t('faq.conditions.excellent.title')}
                description={t('faq.conditions.excellent.description')}
                colorClass="border-green-500"
              />
              <ConditionCard
                title={t('faq.conditions.good.title')}
                description={t('faq.conditions.good.description')}
                colorClass="border-blue-500"
              />
              <ConditionCard
                title={t('faq.conditions.fair.title')}
                description={t('faq.conditions.fair.description')}
                colorClass="border-yellow-500"
              />
              <ConditionCard
                title={t('faq.conditions.poor.title')}
                description={t('faq.conditions.poor.description')}
                colorClass="border-red-500"
              />
            </div>
          </div>

          {/* Contact Link */}
          <div className={`${colorModeContext} p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center`}>
            <p className={`${colorModeContext} text-fluid-sm background-text`}>
              {t('faq.moreQuestions')}{' '}
              <Link to="/contact" className="text-first-color hover:underline font-medium">
                {t('faq.contactUs')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Info
