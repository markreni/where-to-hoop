import { useState, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { useLocationValues } from '../contexts/LocationContext'
import { BackArrow } from '../components/reusable/BackArrow'
import { EnrollmentCard } from '../components/reusable/EnrollmentCard'
import { HoopCard } from '../components/reusable/HoopCard'
import { FollowingPlayerCard } from '../components/reusable/FollowingPlayerCard'
import { RequestCard } from '../components/reusable/RequestCard'
import Footer from '../components/Footer'
import { fetchUserEnrollments, fetchAllEnrollments, updateProfileVisibility, fetchIncomingFollowRequests, fetchFollowers, getProfileImageUrl } from '../utils/requests'
import { useFavorites } from '../hooks/useFavorites'
import { useFollowing } from '../hooks/useFollowing'
import { groupEnrollmentsByHoop } from '../utils/functions'
import haversineDistance from '../utils/functions'
import type { BasketballHoop, ColorMode, Coordinates, FollowRequest, PlayerEnrollment, ProfileImage, PublicProfile } from '../types/types'
import { ProfileVisibilityToggle } from '../components/reusable/ProfileVisibilityToggle'
import ProfileImageUpload from '../components/reusable/ProfileImageUpload'
import { MdOutlineFavoriteBorder, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { GiBasketballBasket } from 'react-icons/gi'
import { FaUserCircle, FaUserPlus } from 'react-icons/fa'
import { Button } from 'react-aria-components'
import { useOnClickOutside } from 'usehooks-ts'

interface MyProfileProps {
  hoops: BasketballHoop[]
}

type Tab = 'enrollments' | 'favorites' | 'following' | 'requests'

const MyProfile = ({ hoops }: MyProfileProps) => {
  const { user } = useAuth()
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { success, error } = useToast()
  const userLocation: Coordinates = useLocationValues()
  const [activeTab, setActiveTab] = useState<Tab>('enrollments')
  const [isPublic, setIsPublic] = useState<boolean>(user?.user_metadata?.public ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [followersOpen, setFollowersOpen] = useState(false)
  const followersRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(followersRef as React.RefObject<HTMLElement>, () => setFollowersOpen(false))

  const { data: followers = [] } = useQuery<PublicProfile[]>({
    queryKey: ['followers', user?.id],
    queryFn: () => fetchFollowers(user!.id),
    enabled: !!user,
  })
  const { favoriteIds } = useFavorites()
  const { followingProfiles, isLoading: isLoadingFollowing } = useFollowing()

  const { data: followRequests = [], isLoading: isLoadingRequests } = useQuery<FollowRequest[]>({
    queryKey: ['incomingFollowRequests', user?.id],
    queryFn: () => fetchIncomingFollowRequests(user!.id),
    enabled: !!user && !isPublic,
  })

  const { data: enrollments = [], isLoading } = useQuery<PlayerEnrollment[]>({
    queryKey: ['userEnrollments', user?.id],
    queryFn: () => fetchUserEnrollments(user!.id),
    enabled: !!user,
  })

  const { data: allEnrollments = [] } = useQuery<PlayerEnrollment[]>({
    queryKey: ['allEnrollments'],
    queryFn: fetchAllEnrollments,
    enabled: activeTab === 'favorites',
  })

  const enrollmentsByHoop: Map<string, PlayerEnrollment[]> = groupEnrollmentsByHoop(allEnrollments)
  const favoriteHoops: BasketballHoop[] = hoops.filter(h => favoriteIds.includes(h.id))

  const handleVisibilityToggle = async () => {
    const next = !isPublic
    setIsPublic(next)
    if (next && activeTab === 'requests') setActiveTab('enrollments')
    setIsSaving(true)
    try {
      await updateProfileVisibility(user!.id, next)
      success(t('myProfile.visibilityUpdated'))
    } catch {
      setIsPublic(!next)
      error(t('myProfile.visibilityUpdateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return <Navigate to="/signin" replace />

  const nickname = user.user_metadata?.nickname ?? "Anonymous"
  const profileImage: ProfileImage | null = user.user_metadata?.profile_image ?? null
  const profileImageUrl = profileImage ? getProfileImageUrl(profileImage.imagePath) : undefined

  const now = new Date()
  const upcoming: PlayerEnrollment[] = enrollments
    .filter(e => e.arrivalTime >= now)
    .sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime())
  const past: PlayerEnrollment[] = enrollments
    .filter(e => e.arrivalTime < now)
    .sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime())

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col relative`}>
      <BackArrow />
      {/* Followers dropdown */}
      <div className="absolute right-3 lg:right-5 top-24">
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
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-start gap-4 mb-3">
              <ProfileImageUpload
                imageUrl={profileImageUrl}
                userName={nickname}
                userId={user.id}
                image={profileImage}
                onImageUpdated={() => {}}
              />
              {/* Nickname + Email */}
              <div className='flex flex-col items-start gap-0'>
                <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black`}>
                  {nickname}
                </h1>
                 <p className={`${colorModeContext} text-fluid-sm background-text-reverse-black`}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Profile visibility toggle */}
            <div className="bg-background/60 p-4 rounded-lg border border-black/30 dark:border-white/30 mb-6">
              <ProfileVisibilityToggle
                label={t('myProfile.profileVisibility')}
                hint={t('myProfile.profileVisibilityHint')}
                isChecked={!isPublic}
                onChange={handleVisibilityToggle}
                disabled={isSaving}
                statusText={isPublic ? t('myProfile.statusPublic') : t('myProfile.statusPrivate')}
                statusClassName={isPublic ? 'text-first-color' : 'text-gray-400 dark:text-gray-500'}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className={`${colorModeContext} flex gap-1 p-1 bg-third-color/20 dark:bg-white/10 rounded-lg mb-6`}>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'enrollments'
                  ? `${colorModeContext} bg-first-color background-text-reverse-black`
                  : `${colorModeContext} background-text hover:text-first-color`
              }`}
            >
              <GiBasketballBasket size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.enrollmentsTab')}</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'favorites'
                  ? `${colorModeContext} bg-first-color background-text-reverse-black`
                  : `${colorModeContext} background-text hover:text-first-color`
              }`}
            >
              <MdOutlineFavoriteBorder size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.favoritesTab')}</span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'following'
                  ? `${colorModeContext} bg-first-color background-text-reverse-black`
                  : `${colorModeContext} background-text hover:text-first-color`
              }`}
            >
              <FaUserCircle size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.followingTab')}</span>
            </button>
            {!isPublic && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors relative ${
                  activeTab === 'requests'
                    ? `${colorModeContext} bg-first-color background-text-reverse-black`
                    : `${colorModeContext} background-text hover:text-first-color`
                }`}
              >
                <FaUserPlus size={16} />
                <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.requestsTab')}</span>
                {followRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {followRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="flex flex-col gap-8">
              <section>
                <h2 className={`${colorModeContext} text-fluid-sm font-medium background-text mb-3`}>
                  {t('myProfile.upcomingEnrollments')}
                </h2>
                {isLoading ? (
                  <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                ) : upcoming.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {upcoming.map(e => <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />)}
                  </div>
                ) : (
                  <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-600`}>
                    {t('myProfile.noUpcoming')}
                  </p>
                )}
              </section>

              <section>
                <h2 className={`${colorModeContext} text-fluid-sm font-medium background-text mb-3`}>
                  {t('myProfile.pastEnrollments')}
                </h2>
                {isLoading ? (
                  <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                ) : past.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {past.map(e => <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />)}
                  </div>
                ) : (
                  <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-600`}>
                    {t('myProfile.noPast')}
                  </p>
                )}
              </section>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            favoriteHoops.length > 0 ? (
              <div className="flex flex-col gap-3">
                {favoriteHoops.map(hoop => {
                  const distance =
                    userLocation.latitude != null && userLocation.longitude != null &&
                    hoop.coordinates.latitude != null && hoop.coordinates.longitude != null
                      ? haversineDistance(
                          [userLocation.latitude, userLocation.longitude],
                          [hoop.coordinates.latitude, hoop.coordinates.longitude]
                        )
                      : 0
                  return (
                    <HoopCard
                      key={hoop.id}
                      hoop={hoop}
                      distance={distance}
                      playerEnrollments={enrollmentsByHoop.get(hoop.id) ?? []}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <MdOutlineFavoriteBorder size={48} className="text-first-color opacity-40" />
                <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-600 text-center`}>
                  {t('myProfile.noFavorites')}
                </p>
              </div>
            )
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            isLoadingFollowing ? (
              <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
            ) : followingProfiles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {followingProfiles.map(profile => (
                  <FollowingPlayerCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <FaUserCircle size={48} className="text-first-color opacity-40" />
                <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-600 text-center`}>
                  {t('myProfile.noFollowing')}
                </p>
              </div>
            )
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            isLoadingRequests ? (
              <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
            ) : followRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {followRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    request={req}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <FaUserPlus size={48} className="text-first-color opacity-40" />
                <p className={`${colorModeContext} text-fluid-sm text-gray-200 dark:text-gray-600 text-center`}>
                  {t('myProfile.noRequests')}
                </p>
              </div>
            )
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyProfile
