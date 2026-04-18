import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import type { ColorMode } from '../../types/types'

export const LocationTip = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  return (
    <div className={`${colorModeContext} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
      <p className={`${colorModeContext} text-fluid-sm background-text`}>
        <strong>{t('common.locationTip')}</strong> {t('common.locationTipText')}
      </p>
    </div>
  )
}
