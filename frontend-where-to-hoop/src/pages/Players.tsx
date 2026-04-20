import { useQuery } from '@tanstack/react-query'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { BackArrow } from '../components/reusable/BackArrow'
import { PublicPlayerCard } from '../components/reusable/PublicPlayerCard'
import Footer from '../components/Footer'
import { fetchAllPlayers } from '../services/requests'
import type { ColorMode, PublicProfile } from '../types/types'
import { FaUserCircle } from 'react-icons/fa'

const Players = () => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()

  const { data: players = [], isLoading } = useQuery<PublicProfile[]>({
    queryKey: ['players'],
    queryFn: fetchAllPlayers,
  })

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">

          <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black mb-6`}>
            {t('players.title')}
          </h1>

          {isLoading ? (
            <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
          ) : players.length > 0 ? (
            <div className="max-h-[480px] overflow-y-auto flex flex-col gap-2 pr-1">
              {players.map(profile => (
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
