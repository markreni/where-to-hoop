import { Link } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import type { ColorMode } from '../types/types'
import { GiBasketballBall } from 'react-icons/gi'
import Footer from '../components/Footer'

const NotFound = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  return (
    <div className={`${colorModeContext} min-h-screen flex flex-col`}>
      <div className="flex-grow flex flex-col items-center justify-center gap-6 px-4 text-center">
        <GiBasketballBall size={64} className="text-first-color opacity-60" />
        <h1 className={`${colorModeContext} text-fluid-4xl poppins-bold background-text-reverse-black`}>
          404
        </h1>
        <p className={`${colorModeContext} text-fluid-lg background-text-reverse-black`}>
          {t('notFound.message')}
        </p>
        <Link
          to="/"
          className={`${colorModeContext} px-6 py-3 rounded-lg bg-first-color border background-border-reverse background-text-reverse-black font-medium main-color-hover transition-colors`}
        >
          {t('notFound.backHome')}
        </Link>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
