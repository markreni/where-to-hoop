import { Link } from 'react-router-dom'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuth } from '../../contexts/AuthContext'
import { useFollowing } from '../../hooks/useFollowing'
import type { ColorMode, PublicProfile } from '../../types/types'
import { MdArrowForward } from 'react-icons/md'
import ProfileCircle from './ProfileCircle'
import { getProfileImageUrl } from '../../utils/requests'

interface PublicPlayerCardProps {
  profile: PublicProfile
}

const PublicPlayerCard = ({ profile }: PublicPlayerCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isFollowing, isRequested, toggleFollow } = useFollowing()

  const isOwnProfile = user?.id === profile.id

  return (
    <div className={`${colorModeContext} flex items-center gap-3 p-3 rounded-lg bg-background shadow-sm border border-third-color/20 dark:border-white/10`}>
      <ProfileCircle
        name={profile.nickname}
        imageUrl={profile.profileImage ? getProfileImageUrl(profile.profileImage.imagePath) : undefined}
        size="sm"
      />

      <Link
        to={`/players/${profile.nickname.toLowerCase()}`}
        className="flex-1 min-w-0 flex items-center gap-1 group"
      >
        <span className={`${colorModeContext} text-fluid-sm font-medium background-text truncate group-hover:text-first-color transition-colors`}>
          {profile.nickname}
        </span>
        <MdArrowForward size={14} className="text-first-color opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
      </Link>

      {isOwnProfile && (
        <span className="shrink-0 px-2 py-0.5 rounded-full text-fluid-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          {t('players.you')}
        </span>
      )}

      {!isOwnProfile && user && (
        <button
          onClick={() => toggleFollow(profile.id, profile.public)}
          className={`shrink-0 px-3 py-1 rounded-md border text-fluid-xs font-medium transition-all hover:scale-105 ${
            isFollowing(profile.id)
              ? `${colorModeContext} border-first-color text-first-color bg-transparent hover:bg-first-color/10`
              : `${colorModeContext} border-first-color bg-first-color text-white hover:bg-second-color`
          }`}
        >
          {isFollowing(profile.id)
            ? t('myProfile.unfollow')
            : isRequested(profile.id)
              ? t('myProfile.requested')
              : t('myProfile.follow')}
        </button>
      )}
    </div>
  )
}

export { PublicPlayerCard }
