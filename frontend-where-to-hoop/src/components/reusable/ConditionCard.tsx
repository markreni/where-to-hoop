import { useColorModeValues } from '../../contexts/DarkModeContext'
import type { ColorMode } from '../../types/types'

interface ConditionCardProps {
  title: string
  description: string
  colorClass?: string
}

const ConditionCard = ({ title, description, colorClass }: ConditionCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (
    <div className={`${colorModeContext} p-4 rounded-lg border-l-4 ${colorClass} bg-gray-50 dark:bg-gray-800`}>
      <p className={`${colorModeContext} font-semibold background-text mb-1`}>
        {title}
      </p>
      <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
        {description}
      </p>
    </div>
  )
}

export { ConditionCard }
export type { ConditionCardProps }
