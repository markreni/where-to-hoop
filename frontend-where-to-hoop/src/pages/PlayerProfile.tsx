import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFollowing } from '../hooks/useFollowing'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import { EnrollmentCard } from '../components/reusable/EnrollmentCard'
import { fetchPlayerByNickname, fetchUserEnrollments } from '../utils/requests'
import type { BasketballHoop, ColorMode, PlayerEnrollment, PublicProfile } from '../types/types'
import { FaUserCircle, FaLock } from 'react-icons/fa'

interface PlayerProfileProps {
  hoops: BasketballHoop[]
}

const PlayerProfile = ({ hoops }: PlayerProfileProps) => {
  const { nickname } = useParams<{ nickname: string }>()
  const { user } = useAuth()
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { isFollowing, toggleFollow } = useFollowing()

  const { data: profile, isLoading: isLoadingProfile, isError } = useQuery<PublicProfile>({
    queryKey: ['player', nickname],
    queryFn: () => fetchPlayerByNickname(nickname!),
    enabled: !!nickname,
  })

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<PlayerEnrollment[]>({
    queryKey: ['userEnrollments', profile?.id],
    queryFn: () => fetchUserEnrollments(profile!.id),
    enabled: !!profile,
  })

  const isOwnProfile = !!user && !!profile && user.id === profile.id

  const recentEnrollments = [...enrollments]
    .sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime())
    .slice(0, 10)

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">

          {isLoadingProfile ? (
            <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
          ) : isError || !profile ? (
            <p className={`${colorModeContext} text-fluid-base background-text`}>
              {t('playerProfile.notFound')}
            </p>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <FaUserCircle size={64} className={`${colorModeContext} background-text-reverse-black transition-opacity shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-reverse-black truncate`}>
                    {profile.nickname}
                  </h1>
                </div>
                {!isOwnProfile && user && (
                  <button
                    onClick={() => toggleFollow(profile.id)}
                    className={`${colorModeContext} shrink-0 px-4 py-2 rounded-lg border-2 background-text-reverse-black text-fluid-sm background-reverse-border bg-black/30 hover:bg-black/50 font-medium transition-all dark:bg-white/30 dark:hover:bg-white/50`}>
                    {isFollowing(profile.id) ? t('myProfile.unfollow') : t('myProfile.follow')}
                  </button>
                )}
              </div>

              {/* Private profile lock */}
              {!profile.public && !isOwnProfile ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FaLock size={36} className="text-first-color opacity-40" />
                  <p className={`${colorModeContext} text-fluid-base font-medium background-text text-center`}>
                    {t('playerProfile.privateProfile')}
                  </p>
                  <p className={`${colorModeContext} text-fluid-sm text-gray-400 dark:text-gray-500 text-center max-w-xs`}>
                    {t('playerProfile.privateProfileSub')}
                  </p>
                </div>
              ) : (
                /* Recent Sessions */
                <section>
                  <h2 className={`${colorModeContext} text-fluid-base font-medium background-text-reverse-black mb-3`}>
                    {t('playerProfile.recentSessions')}
                  </h2>
                  {isLoadingEnrollments ? (
                    <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                  ) : recentEnrollments.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {recentEnrollments.map(e => (
                        <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />
                      ))}
                    </div>
                  ) : (
                    <p className={`${colorModeContext} text-fluid-sm background-text`}>
                      {t('playerProfile.noSessions')}
                    </p>
                  )}
                </section>
              )}
            </>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PlayerProfile
