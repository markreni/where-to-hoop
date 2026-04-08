import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFollowing } from '../hooks/useFollowing'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import { EnrollmentCard } from '../components/reusable/EnrollmentCard'
import { fetchPlayerByNickname, fetchActiveEnrollments, fetchExpiredEnrollmentCount, fetchFollowers, getProfileImageUrl } from '../services/requests'
import type { BasketballHoop, ColorMode, PlayerEnrollment, PublicProfile } from '../types/types'
import { FaLock, FaUsers } from 'react-icons/fa'
import { ProfileCircle } from '../components/reusable/ProfileCircle'
import { GiBasketballBasket } from 'react-icons/gi'
import { Button } from 'react-aria-components'

interface PlayerProfileProps {
  hoops: BasketballHoop[]
}

const PlayerProfile = ({ hoops }: PlayerProfileProps) => {
  const { nickname } = useParams<{ nickname: string }>()
  const { user } = useAuth()
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { isFollowing, isRequested, toggleFollow } = useFollowing()

  const { data: profile, isLoading: isLoadingProfile, isError } = useQuery<PublicProfile>({
    queryKey: ['player', nickname],
    queryFn: () => fetchPlayerByNickname(nickname!),
    enabled: !!nickname,
  })

  const { data: upcomingEnrollments = [], isLoading: isLoadingEnrollments } = useQuery<PlayerEnrollment[]>({
    queryKey: ['activeEnrollments', profile?.id],
    queryFn: () => fetchActiveEnrollments(profile!.id),
    enabled: !!profile,
  })

  const { data: timesPlayed = 0 } = useQuery<number>({
    queryKey: ['expiredEnrollmentCount', profile?.id],
    queryFn: () => fetchExpiredEnrollmentCount(profile!.id),
    enabled: !!profile,
  })

  const { data: followers = [] } = useQuery<PublicProfile[]>({
    queryKey: ['followers', profile?.id],
    queryFn: () => fetchFollowers(profile!.id),
    enabled: !!profile,
  })

  const isOwnProfile = !!user && !!profile && user.id === profile.id
  const canViewProfile = isOwnProfile || profile?.public || (!!profile && isFollowing(profile.id))

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
              <div className="flex items-center gap-4 mb-4">
                <ProfileCircle
                  name={profile.nickname}
                  imageUrl={profile.profileImage ? getProfileImageUrl(profile.profileImage.imagePath) : undefined}
                  size="xl"
                  expandable
                />
                <div className="flex-1 min-w-0">
                  <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-reverse-black truncate`}>
                    {profile.nickname}
                  </h1>
                  
                </div>
                {!isOwnProfile && user && (
                  <Button
                    onClick={() => toggleFollow(profile.id, profile.public)}
                    className={`${colorModeContext} shrink-0 px-4 py-2 rounded-lg border-2 background-text-reverse-black text-fluid-sm background-reverse-border bg-black/30 hover:bg-black/50 font-medium transition-all dark:bg-white/30 dark:hover:bg-white/50`}>
                    {isFollowing(profile.id)
                      ? t('myProfile.unfollow')
                      : isRequested(profile.id)
                        ? t('myProfile.requested')
                        : t('myProfile.follow')}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className={`${colorModeContext} flex items-center gap-6 mb-8 text-fluid-sm background-text-reverse-black opacity-70`}>
                <div className="flex items-center gap-1.5">
                  <FaUsers size={14} />
                  <span>{t('playerProfile.followers', { count: followers.length })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GiBasketballBasket size={14} />
                  <span>{t('playerProfile.timesPlayed', { count: timesPlayed })}</span>
                </div>
              </div>

              {/* Private profile lock */}
              {!canViewProfile ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FaLock size={36} className="text-first-color opacity-40" />
                  <p className={`${colorModeContext} text-fluid-base font-medium background-text text-center`}>
                    {t('playerProfile.privateProfile')}
                  </p>
                  <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-900 text-center max-w-xs`}>
                    {t('playerProfile.privateProfileSub')}
                  </p>
                </div>
              ) : (
                /* Upcoming / Ongoing Sessions */
                <section>
                  <h2 className={`${colorModeContext} text-fluid-base font-medium background-text-reverse-black mb-3`}>
                    {t('playerProfile.upcomingSessions')}
                  </h2>
                  {isLoadingEnrollments ? (
                    <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                  ) : upcomingEnrollments.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {upcomingEnrollments.map(e => (
                        <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />
                      ))}
                    </div>
                  ) : (
                    <p className={`${colorModeContext} text-fluid-sm background-text`}>
                      {t('playerProfile.noUpcomingSessions')}
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
