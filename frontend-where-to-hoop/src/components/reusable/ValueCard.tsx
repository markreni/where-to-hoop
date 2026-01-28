import { useColorModeValues } from '../../contexts/DarkModeContext'
import type { ColorMode } from '../../types/types'

interface ValueCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const ValueCard = ({ icon, title, description }: ValueCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (
    <div className={`${colorModeContext} flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      {icon}
      <span className={`${colorModeContext} text-fluid-base background-text text-center font-semibold`}>
        {title}
      </span>
      <span className={`${colorModeContext} text-fluid-sm background-text text-center`}>
        {description}
      </span>
    </div>
  )
}

export { ValueCard }
export type { ValueCardProps }
