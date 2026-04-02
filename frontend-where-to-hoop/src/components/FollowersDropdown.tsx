import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import type { ColorMode, PublicProfile } from '../types/types'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { Button } from 'react-aria-components'
import { useOnClickOutside } from 'usehooks-ts'

interface FollowersDropdownProps {
  followers: PublicProfile[]
}

const FollowersDropdown = ({ followers }: FollowersDropdownProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const [followersOpen, setFollowersOpen] = useState(false)
  const followersRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(followersRef as React.RefObject<HTMLElement>, () => setFollowersOpen(false))

  return (
    <div>
      <div className="relative" ref={followersRef}>
        <Button
          onClick={() => setFollowersOpen(o => !o)}
          className={`${colorModeContext} flex items-center gap-1 text-fluid-sm background-text-black hover:text-first-color transition-colors`}
          >
            {followersOpen ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
            {t('myProfile.followers')} ({followers.length})
        </Button>
        {followersOpen && (
          <div className={`${colorModeContext} absolute right-0 top-full mt-1 z-10 min-w-40 max-h-48 overflow-y-auto bg-background border border-black/20 dark:border-white/20 rounded-lg shadow-lg p-2 flex flex-col gap-1`}>
            {followers.length > 0 ? followers.map(f => (
             <Link
                key={f.id}
                to={`/players/${f.nickname.toLowerCase()}`}
                className={`${colorModeContext} text-fluid-sm background-text hover:text-first-color transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5`}
                >
                {f.nickname}
               </Link>
            )) : (
                <p className={`${colorModeContext} text-fluid-sm text-gray-400 dark:text-gray-500 px-2 py-1`}>
                  {t('myProfile.noFollowers')}
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowersDropdown
