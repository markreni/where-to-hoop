import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import { BackArrow } from '../components/reusable/BackArrow'
import { SearchFilter } from '../components/reusable/SearchFilter'
import { PublicPlayerCard } from '../components/reusable/PublicPlayerCard'
import Footer from '../components/Footer'
import { fetchAllPlayers, searchAllPlayersByNickname } from '../utils/requests'
import type { ColorMode, PublicProfile } from '../types/types'
import { FaUserCircle } from 'react-icons/fa'
import { MdPersonSearch } from 'react-icons/md'

const Players = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [findQuery, setFindQuery] = useState('')

  const { data: players = [], isLoading } = useQuery<PublicProfile[]>({
    queryKey: ['players'],
    queryFn: fetchAllPlayers,
  })

  const { data: findResults = [], isFetching: isFindFetching } = useQuery<PublicProfile[]>({
    queryKey: ['searchAllPlayers', findQuery],
    queryFn: () => searchAllPlayersByNickname(findQuery),
    enabled: !!user && findQuery.trim().length >= 2,
  })

  const filtered = search.trim()
    ? players.filter(p => p.nickname.toLowerCase().includes(search.toLowerCase()))
    : players

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">

          <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black mb-6`}>
            {t('players.title')}
          </h1>

          <div className="mb-4">
            <SearchFilter
              placeholder={t('players.search')}
              value={search}
              onChange={setSearch}
            />
          </div>

          {isLoading ? (
            <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
          ) : filtered.length > 0 ? (
            <div className="max-h-[480px] overflow-y-auto flex flex-col gap-2 pr-1">
              {filtered.map(profile => (
                <PublicPlayerCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <FaUserCircle size={48} className={`${colorModeContext} background-text-reverse opacity-40`} />
              <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-700 text-center`}>
                {t('players.noResults')}
              </p>
            </div>
          )}

          {/* Find any player section */}
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${colorModeContext} text-fluid-base font-semibold background-text-black`}>
                {t('players.findPlayer')}
              </h2>
              <MdPersonSearch size={20} className={`${colorModeContext} background-text-black shrink-0`} />
            </div>
            <p className={`${colorModeContext} text-fluid-xs background-text mb-4 opacity-60`}>
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

                {isFindFetching ? (
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
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Players
