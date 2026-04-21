import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounceValue } from 'usehooks-ts'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import { BackArrow } from '../components/reusable/BackArrow'
import { SearchFilter } from '../components/reusable/SearchFilter'
import { PublicPlayerCard } from '../components/reusable/PublicPlayerCard'
import Footer from '../components/Footer'
import { searchAllPlayersByNickname } from '../services/requests'
import type { ColorMode, PublicProfile } from '../types/types'
import { FaUserCircle } from 'react-icons/fa'

const SearchPlayers = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl: string = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(queryFromUrl)
  const [debouncedQuery] = useDebounceValue(inputValue, 300)

  useEffect(() => {
    setSearchParams(prev => {
      const next: URLSearchParams = new URLSearchParams(prev)
      if (debouncedQuery.trim()) {
        next.set('q', debouncedQuery)
      } else {
        next.delete('q')
      }
      return next
    }, { replace: true })
    // setSearchParams intentionally omitted: its identity changes on every
    // searchParams change, which would re-fire this effect with a stale
    // debouncedQuery and clobber concurrent writes (e.g. the navbar input).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  useEffect(() => {
    setInputValue(queryFromUrl)
  }, [queryFromUrl])

  const { data: findResults = [], isFetching } = useQuery<PublicProfile[]>({
    queryKey: ['searchAllPlayers', debouncedQuery],
    queryFn: () => searchAllPlayersByNickname(debouncedQuery),
    enabled: !!user && debouncedQuery.trim().length >= 2,
  })

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">
          <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black mb-2`}>
            {t('players.findPlayer')}
          </h1>

          <p className={`${colorModeContext} text-fluid-sm background-text mb-4 opacity-60`}>
            {t('players.findPlayerHint')}
          </p>

          {user ? (
            <>
              <div className="mb-4">
                <SearchFilter
                  placeholder={t('players.findPlayerPlaceholder')}
                  value={inputValue}
                  onChange={setInputValue}
                  autoFocus
                />
              </div>

              {isFetching ? (
                <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
              ) : debouncedQuery.trim().length >= 2 ? (
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
      <Footer />
    </div>
  )
}

export default SearchPlayers
