import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { BackArrow } from '../components/reusable/BackArrow'
import { SearchFilter } from '../components/reusable/SearchFilter'
import { PublicPlayerCard } from '../components/reusable/PublicPlayerCard'
import Footer from '../components/Footer'
import { fetchAllPlayers } from '../utils/requests'
import type { ColorMode, PublicProfile } from '../types/types'
import { FaUserCircle } from 'react-icons/fa'

const Players = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''

  const setSearch = (value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value.trim()) {
        next.set('q', value);
      } else {
        next.delete('q');
      }
      return next;
    }, { replace: true });
  }

  const { data: players = [], isLoading } = useQuery<PublicProfile[]>({
    queryKey: ['players'],
    queryFn: fetchAllPlayers,
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

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Players
