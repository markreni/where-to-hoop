import { useColorModeValues } from '../../contexts/DarkModeContext'
import type { ColorMode } from '../../types/types'

interface ValueCardProps {
  icon: React.ReactNode
  text: string
}

const ValueCard = ({ icon, text }: ValueCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (
    <div className={`${colorModeContext} flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      {icon}
      <span className={`${colorModeContext} text-fluid-sm background-text text-center font-medium`}>
        {text}
      </span>
    </div>
  )
}

export { ValueCard }
export type { ValueCardProps }
