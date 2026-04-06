import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useToast } from '../../contexts/ToastContext'
import { useTranslation } from '../../hooks/useTranslation'
import { acceptFollowRequest, rejectFollowRequest } from '../../services/requests'
import type { ColorMode, FollowRequest } from '../../types/types'
import { Button } from 'react-aria-components'

interface RequestCardProps {
  request: FollowRequest
}

const RequestCard = ({ request }: RequestCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const handleAccept = async () => {
    try {
      await acceptFollowRequest(request.id)
      success(t('myProfile.acceptSuccess'))
      queryClient.invalidateQueries({ queryKey: ['incomingFollowRequests', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['followers', user?.id] })
    } catch {
      error(t('myProfile.requestError'))
    }
  }

  const handleDecline = async () => {
    try {
      await rejectFollowRequest(request.id)
      success(t('myProfile.declineSuccess'))
      queryClient.invalidateQueries({ queryKey: ['incomingFollowRequests', user?.id] })
    } catch {
      error(t('myProfile.requestError'))
    }
  }

  return (
    <div className={`${colorModeContext} flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 shrink-0 rounded-full bg-first-color flex items-center justify-center text-white text-sm font-medium">
          {request.fromUserNickname.charAt(0).toUpperCase()}
        </div>
        <p className={`${colorModeContext} text-fluid-sm background-text truncate`}>
          {request.fromUserNickname}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          onClick={handleAccept}
          className="px-3 py-1 text-fluid-xs font-medium rounded-full bg-first-color text-white hover:bg-second-color transition-colors cursor-pointer"
        >
          {t('myProfile.accept')}
        </Button>
        <Button
          onClick={handleDecline}
          className="px-3 py-1 text-fluid-xs font-medium rounded-full bg-gray-300 dark:bg-gray-600 background-text hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors cursor-pointer"
        >
          {t('myProfile.decline')}
        </Button>
      </div>
    </div>
  )
}

export { RequestCard }
