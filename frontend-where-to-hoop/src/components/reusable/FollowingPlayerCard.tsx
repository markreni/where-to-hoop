import { Link } from 'react-router-dom'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import type { ColorMode, PublicProfile } from '../../types/types'
import { FaUserCircle } from 'react-icons/fa'
import { MdArrowForward } from 'react-icons/md'

interface FollowingPlayerCardProps {
  profile: PublicProfile
}

const FollowingPlayerCard = ({ profile }: FollowingPlayerCardProps) => {
  const colorModeContext: ColorMode = useColorModeValues()

  return (
    <Link to={`/players/${profile.nickname.toLowerCase()}`}>
      <div className={`${colorModeContext} group flex items-center gap-3 p-3 rounded-lg bg-background/20 border border-black/30 hover:border-black/60 transition-colors dark:border-white/30 dark:hover:border-white/60`}>
        <FaUserCircle size={36} className={`${colorModeContext} background-text opacity-50 group-hover:opacity-80 transition-opacity shrink-0`} />
        <span className={`${colorModeContext} flex-1 text-fluid-sm font-medium background-text opacity-50 group-hover:opacity-80 transition-opacity`}>
          {profile.nickname}
        </span>
        <MdArrowForward size={16} className={`${colorModeContext} background-text opacity-50 group-hover:opacity-80 transition-opacity`} />
      </div>
    </Link>
  )
}

export { FollowingPlayerCard }
