import { useColorModeValues } from '../../contexts/ColorModeContext'
import type { ColorMode } from '../../types/types'

interface FAQItemProps {
  question: string
  answer: string
  icon: React.ReactNode
}

const FAQItem = ({ question, answer, icon }: FAQItemProps) => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (  
  <div className={`${colorModeContext} p-4 rounded-lg bg-gray-100 dark:bg-gray-800`}>
    <div className="flex items-start gap-3">
      <div className="text-first-color flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <p className={`${colorModeContext} font-medium background-text mb-2`}>
          {question}
        </p>
        <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
          {answer}
        </p>
      </div>
    </div>
  </div>
)
}

export { FAQItem }
export type { FAQItemProps }
