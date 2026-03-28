import { useColorModeValues } from '../../contexts/ColorModeContext'
import type { ColorMode } from '../../types/types'

interface ProfileVisibilityToggleProps {
  label: string
  hint: string
  isChecked: boolean
  onChange: () => void
  statusText: string
  statusClassName: string
  disabled?: boolean
}

export const ProfileVisibilityToggle = ({
  label,
  hint,
  isChecked,
  onChange,
  statusText,
  statusClassName,
  disabled = false,
}: ProfileVisibilityToggleProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <div className="flex flex-col gap-0.5">
          <span className={`${colorModeContext} text-fluid-sm font-medium background-text`}>
            {label}
          </span>
          <span className={`${colorModeContext} text-fluid-xs text-gray-400 dark:text-gray-500`}>
            {hint}
          </span>
        </div>
        <div
          onClick={disabled ? undefined : onChange}
          className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isChecked ? 'bg-gray-300 dark:bg-gray-600' : 'bg-first-color'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isChecked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </label>
      <p className={`text-fluid-xs font-medium ${statusClassName}`}>
        {statusText}
      </p>
    </div>
  )}
