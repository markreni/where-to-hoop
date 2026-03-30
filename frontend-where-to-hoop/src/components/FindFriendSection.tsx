import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import { SearchFilter } from './reusable/SearchFilter'
import { PublicPlayerCard } from './reusable/PublicPlayerCard'
import { searchAllPlayersByNickname } from '../utils/requests'
import type { ColorMode, PublicProfile } from '../types/types'
import { FaUserCircle } from 'react-icons/fa'
import { MdPersonSearch } from 'react-icons/md'

interface FindFriendSectionProps {
  variant?: 'section' | 'page'
}

const FindFriendSection = ({ variant = 'section' }: FindFriendSectionProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [findQuery, setFindQuery] = useState('')

  const { data: findResults = [], isFetching } = useQuery<PublicProfile[]>({
    queryKey: ['searchAllPlayers', findQuery],
    queryFn: () => searchAllPlayersByNickname(findQuery),
    enabled: !!user && findQuery.trim().length >= 2,
  })

  const content = (
    <>
      {variant === 'section' ? (
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`${colorModeContext} text-fluid-lg font-semibold background-text-black`}>
            {t('players.findPlayer')}
          </h2>
          <MdPersonSearch size={20} className={`${colorModeContext} background-text-black shrink-0`} />
        </div>
      ) : (
        <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black mb-2`}>
          {t('players.findPlayer')}
        </h1>
      )}

      <p className={`${colorModeContext} text-fluid-sm background-text mb-4 opacity-60`}>
        {t('players.findPlayerHint')}
      </p>

      {user ? (
        <>
          <div className="mb-4">
            <SearchFilter
              placeholder={t('players.findPlayerPlaceholder')}
              value={findQuery}
              onChange={setFindQuery}
            />
          </div>

          {isFetching ? (
            <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
          ) : findQuery.trim().length >= 2 ? (
            findResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {findResults.map(profile => (
                  <PublicPlayerCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <FaUserCircle size={36} className={`${colorModeContext} background-text-reverse opacity-40`} />
                <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-700 text-center`}>
                  {t('players.findPlayerNoResults')}
                </p>
              </div>
            )
          ) : null}
        </>
      ) : (
        <div className={`${colorModeContext} flex items-center gap-2 p-4 rounded-lg bg-background border border-black/10 dark:border-white/10`}>
          <p className={`${colorModeContext} text-fluid-sm background-text`}>
            {t('players.signInToSearch')}
          </p>
          <Link
            to="/signin"
            className="ml-auto shrink-0 px-3 py-1 rounded-md bg-first-color text-white text-fluid-xs font-medium hover:bg-second-color transition-colors"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      )}
    </>
  )

  if (variant === 'section') {
    return (
      <div id="find-friend" className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
        {content}
      </div>
    )
  }

  return <>{content}</>
}

export default FindFriendSection
