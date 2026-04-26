import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { fetchUserEnrollments, fetchAllEnrollments, fetchEnrollmentsForPlayers, updateProfileVisibility, fetchIncomingFollowRequests, fetchFollowers, getProfileImageUrl, fetchUserProfileImage, fetchUserBio, updateUserBio } from '../services/requests'
import { useFavorites } from '../hooks/useFavorites'
import { useFollowing } from '../hooks/useFollowing'
import { groupEnrollmentsByHoop } from '../utils/enrollments'
import { MAX_BIO_LENGTH } from '../utils/constants'
import haversineDistance from '../utils/functions'
import type { BasketballHoop, ColorMode, Coordinates, FollowRequest, PlayerEnrollment, ProfileImage, PublicProfile } from '../types/types'
import { ProfileVisibilityToggle } from '../components/reusable/ProfileVisibilityToggle'
import ProfileImageUpload from '../components/reusable/ProfileImageUpload'
import FollowersDropdown from '../components/FollowersDropdown'
import { MdOutlineFavoriteBorder, MdArrowForward, MdKeyboardArrowDown } from 'react-icons/md'
import { GiBasketballBasket } from 'react-icons/gi'
import { FaUserCircle, FaUserPlus } from 'react-icons/fa'
import { Button } from 'react-aria-components'

interface MyProfileProps {
  hoops: BasketballHoop[]
}

type Tab = 'enrollments' | 'favorites' | 'following' | 'requests'
type SessionScope = 'mine' | 'following'

const MyProfile = ({ hoops }: MyProfileProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const { success, error } = useToast()
  const userLocation: Coordinates = useLocationValues()
  const [activeTab, setActiveTab] = useState<Tab>('enrollments')
  const [sessionScope, setSessionScope] = useState<SessionScope>('mine')
  const [isPublic, setIsPublic] = useState<boolean>(user?.user_metadata?.public ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [bioInput, setBioInput] = useState('')
  const [isSavingBio, setIsSavingBio] = useState(false)
  const [isBioOpen, setIsBioOpen] = useState(false)
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false)
  const { data: followers = [] } = useQuery<PublicProfile[]>({
    queryKey: ['followers', user?.id],
    queryFn: () => fetchFollowers(user!.id),
    enabled: !!user,
  })
  const { favoriteIds } = useFavorites()
  const { followingIds, followingProfiles, isLoading: isLoadingFollowing } = useFollowing()

  const { data: followingEnrollments = [], isLoading: isLoadingFollowingEnrollments } = useQuery<PlayerEnrollment[]>({
    queryKey: ['followingEnrollments', followingIds],
    queryFn: () => fetchEnrollmentsForPlayers(followingIds),
    enabled: activeTab === 'enrollments' && sessionScope === 'following' && followingIds.length > 0,
  })

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

  const { data: savedBio = null } = useQuery<string | null>({
    queryKey: ['userBio', user?.id],
    queryFn: () => fetchUserBio(user!.id),
    enabled: !!user,
  })

  useEffect(() => {
    setBioInput(savedBio ?? '')
  }, [savedBio])

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

  const trimmedBio = bioInput.trim()
  const isBioDirty = trimmedBio !== (savedBio ?? '')
  const bioCharsLeft = MAX_BIO_LENGTH - bioInput.length

  const handleBioSave = async () => {
    if (!user || isSavingBio || !isBioDirty || bioCharsLeft < 0) return
    setIsSavingBio(true)
    try {
      await updateUserBio(user.id, trimmedBio || null)
      queryClient.invalidateQueries({ queryKey: ['userBio', user.id] })
      // also invalidate any cached PublicProfile view of this user
      const ownNickname = user.user_metadata?.nickname
      if (ownNickname) {
        queryClient.invalidateQueries({ queryKey: ['player', ownNickname.toLowerCase()] })
      }
      success(t('myProfile.bioUpdated'))
    } catch {
      error(t('myProfile.bioUpdateFailed'))
    } finally {
      setIsSavingBio(false)
    }
  }

  const handleBioReset = () => {
    setBioInput('')
  }

  if (!user) return null

  const nickname = user.user_metadata?.nickname ?? "Anonymous"
  const { data: profileImage = null } = useQuery<ProfileImage | null>({
    queryKey: ['userProfileImage', user.id],
    queryFn: () => fetchUserProfileImage(user.id),
  })
  // const profileImage: ProfileImage | null = user.user_metadata?.profile_image ?? null <- this was used before implementing admin profile image deletion, leaving it here in case we want to revert back to using metadata for profile images
  const profileImageUrl = profileImage ? getProfileImageUrl(profileImage.imagePath) : undefined

  // const now = new Date()
  const upcoming: PlayerEnrollment[] = enrollments
    .filter(e => !e.expired)
    .sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime())
  const past: PlayerEnrollment[] = enrollments
    .filter(e => e.expired)
    .sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime())

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
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
                onImageUpdated={() => queryClient.invalidateQueries({ queryKey: ['userProfileImage', user.id] })}
              />
              {/* Nickname + Email */}
              <div className='flex flex-col items-start gap-0'>
                <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-reverse-black`}>
                  {nickname}
                </h1>
                 <p className={`${colorModeContext} text-fluid-sm background-text-reverse-black`}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Profile visibility toggle */}
            <div className={`${colorModeContext} bg-background/60 rounded-lg border border-black/30 dark:border-white/30 mb-6 relative`}>
              <div className="absolute -top-31 xs:-top-25 right-0">
                <FollowersDropdown followers={followers} />
              </div>
              <Button
                type="button"
                onPress={() => setIsVisibilityOpen(o => !o)}
                aria-expanded={isVisibilityOpen}
                aria-controls="visibility-panel"
                className={`${colorModeContext} flex items-center justify-between w-full p-4 text-fluid-sm background-text cursor-pointer`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-medium">{t('myProfile.profileVisibility')}</span>
                  <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
                    {t('myProfile.profileVisibilityModifyHint')}
                  </span>
                </div>
                <MdKeyboardArrowDown
                  size={20}
                  className={`transition-transform ${isVisibilityOpen ? 'rotate-180' : ''}`}
                />
              </Button>
              {isVisibilityOpen && (
                <div id="visibility-panel" className="px-4 pb-4">
                  <ProfileVisibilityToggle
                    hint={t('myProfile.profileVisibilityHint')}
                    isChecked={!isPublic}
                    onChange={handleVisibilityToggle}
                    disabled={isSaving}
                    statusText={isPublic ? t('myProfile.statusPublic') : t('myProfile.statusPrivate')}
                    statusClassName={isPublic ? 'text-first-color' : 'text-gray-400 dark:text-gray-500'}
                  />
                </div>
              )}
            </div>

            {/* Bio editor */}
            <div className={`${colorModeContext} bg-background/60 rounded-lg border border-black/30 dark:border-white/30 mb-6 overflow-hidden`}>
              <Button
                type="button"
                onPress={() => setIsBioOpen(o => !o)}
                aria-expanded={isBioOpen}
                aria-controls="bio-panel"
                className={`${colorModeContext} flex items-center justify-between w-full p-4 text-fluid-sm background-text cursor-pointer`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-medium">{t('myProfile.bioLabel')}</span>
                  <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
                    {t('myProfile.bioModifyHint')}
                  </span>
                </div>
                <MdKeyboardArrowDown
                  size={20}
                  className={`transition-transform ${isBioOpen ? 'rotate-180' : ''}`}
                />
              </Button>
              {isBioOpen && (
                <div id="bio-panel" className="px-4 pb-4">
                  <textarea
                    id="bio-input"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    maxLength={MAX_BIO_LENGTH}
                    rows={3}
                    placeholder={t('myProfile.bioPlaceholder')}
                    className={`${colorModeContext} form-input w-full resize-y text-fluid-sm border-black/20 dark:border-white/20`}
                    disabled={isSavingBio}
                  />
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <span
                      className={`${colorModeContext} text-fluid-xs font-medium ${
                        bioCharsLeft < 0
                          ? 'text-red-500'
                          : bioCharsLeft == MAX_BIO_LENGTH
                          ? 'text-gray-500 dark:text-gray-400'
                          : bioCharsLeft < MAX_BIO_LENGTH * 0.1
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {t('myProfile.bioCharCountLabel')} {bioInput.length}/{MAX_BIO_LENGTH}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onPress={handleBioReset}
                        isDisabled={isSavingBio || bioInput.length === 0}
                        className={`${colorModeContext} px-3 py-1.5 rounded-md text-fluid-xs font-medium background-text border border-black/20 dark:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed ${bioInput.length > 0 ? 'cursor-pointer' : ''}`}
                      >
                        {t('myProfile.bioReset')}
                      </Button>
                      <Button
                        type="button"
                        onPress={handleBioSave}
                        isDisabled={!isBioDirty || isSavingBio || bioCharsLeft < 0}
                        className={`${colorModeContext} px-3 py-1.5 rounded-md text-fluid-xs font-medium bg-first-color text-white disabled:opacity-40 disabled:cursor-not-allowed ${bioInput.length > 0 ? 'cursor-pointer' : ''}`}
                      >
                        {isSavingBio ? t('myProfile.bioSaving') : t('myProfile.bioSave')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View public profile link */}
            <Link
              to={`/players/${nickname.toLowerCase()}`}
              className={`${colorModeContext} group flex items-center justify-center gap-2 w-full py-3 text-fluid-sm font-medium background-text-reverse transition-colors rounded-lg border border-background/20`}
            >
              <FaUserCircle size={16} />
              {t('myProfile.viewPublicProfile')}
              <MdArrowForward size={16} className={`${colorModeContext} background-text-reverse opacity-60 sm:opacity-0 sm:group-hover:opacity-60 transition-opacity`} />
            </Link>
          </div>

          {/* Tabs */}
          <div className={`${colorModeContext} flex gap-1 p-1 bg-third-color/20 dark:bg-white/10 rounded-lg mb-6`}>
            <Button
              onPress={() => setActiveTab('enrollments')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'enrollments'
                  ? `${colorModeContext} bg-first-color background-text-black`
                  : `${colorModeContext} background-text-reverse-black hover:text-first-color`
              }`}
            >
              <GiBasketballBasket size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.enrollmentsTab')}</span>
            </Button>
            <Button
              onPress={() => setActiveTab('favorites')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'favorites'
                  ? `${colorModeContext} bg-first-color background-text-black`
                  : `${colorModeContext} background-text-reverse-black hover:text-first-color`
              }`}
            >
              <MdOutlineFavoriteBorder size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.favoritesTab')}</span>
            </Button>
            <Button
              onClick={() => setActiveTab('following')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'following'
                  ? `${colorModeContext} bg-first-color background-text-black`
                  : `${colorModeContext} background-text-reverse-black hover:text-first-color`
              }`}
            >
              <FaUserCircle size={16} />
              <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.followingTab')}</span>
            </Button>
            {!isPublic && (
              <Button
                onPress={() => setActiveTab('requests')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors relative ${
                  activeTab === 'requests'
                    ? `${colorModeContext} bg-first-color background-text-black`
                    : `${colorModeContext} background-text-reverse-black hover:text-first-color`
                }`}
              >
                <FaUserPlus size={16} />
                <span className="text-[10px] sm:text-fluid-sm">{t('myProfile.requestsTab')}</span>
                {followRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {followRequests.length}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="flex flex-col gap-8">
              {/* Scope sub-toggle */}
              <div className={`${colorModeContext} flex border-1 border-white/80 dark:border-black/70 rounded-lg overflow-hidden mx-8`}>
                <Button
                  type="button"
                  onClick={() => setSessionScope('mine')}
                  className={`${colorModeContext} flex-1 py-2 px-4 text-fluid-sm font-medium transition-colors cursor-pointer ${
                    sessionScope === 'mine'
                      ? `${colorModeContext} bg-background/80 background-text`
                      : `${colorModeContext} background-text bg-background/60 hover:opacity-70`
                  }`}
                >
                  {t('myProfile.scopeMine')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setSessionScope('following')}
                  className={`${colorModeContext} flex-1 py-2 px-4 text-fluid-sm font-medium transition-colors cursor-pointer ${
                    sessionScope === 'following'
                      ? `${colorModeContext} bg-background/80 background-text`
                      : `${colorModeContext} background-text bg-background/60 hover:opacity-70`
                  }`}
                >
                  {t('myProfile.scopeFollowing')}
                </Button>
              </div>

              {sessionScope === 'mine' && (
                <>
                  <section>
                    <h2 className={`${colorModeContext} text-fluid-sm font-medium background-text-reverse mb-3`}>
                      {t('myProfile.upcomingEnrollments')}
                    </h2>
                    {isLoading ? (
                      <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                    ) : upcoming.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {upcoming.map(e => <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />)}
                      </div>
                    ) : (
                      <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200`}>
                        {t('myProfile.noUpcoming')}
                      </p>
                    )}
                  </section>

                  <section>
                    <h2 className={`${colorModeContext} text-fluid-sm font-medium background-text-reverse mb-3`}>
                      {t('myProfile.pastEnrollments')}
                    </h2>
                    {isLoading ? (
                      <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                    ) : past.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {past.map(e => <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />)}
                      </div>
                    ) : (
                      <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200`}>
                        {t('myProfile.noPast')}
                      </p>
                    )}
                  </section>
                </>
              )}

              {sessionScope === 'following' && (
                <section>
                  {followingIds.length !== 0 && (
                  <h2 className={`${colorModeContext} text-fluid-sm font-medium background-text-reverse mb-3`}>
                    {t('myProfile.upcomingEnrollments')}
                  </h2>
                  )}
                  {followingIds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-3 gap-4">
                      <FaUserCircle size={48} className={`${colorModeContext} background-text-reverse-black opacity-40`} />
                      <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200 text-center`}>
                        {t('myProfile.noFollowingPlayers')}
                      </p>
                      <Link
                        to="/search-players"
                        className={`${colorModeContext} px-4 py-2 rounded-md text-fluid-xs border background-border-reverse font-medium bg-first-color background-text-reverse-black hover:bg-second-color transition-colors`}
                      >
                        {t('myProfile.findPlayers')}
                      </Link>
                    </div>
                  ) : isLoadingFollowingEnrollments ? (
                    <p className={`${colorModeContext} text-fluid-xs text-gray-400`}>...</p>
                  ) : followingEnrollments.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {followingEnrollments.map(e => <EnrollmentCard key={e.id} enrollment={e} hoops={hoops} />)}
                    </div>
                  ) : (
                    <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200`}>
                      {t('myProfile.noFollowingSessions')}
                    </p>
                  )}
                </section>
              )}
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
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <MdOutlineFavoriteBorder size={48} className={`${colorModeContext} background-text-reverse-black opacity-40`} />
                <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200 text-center`}>
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
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <FaUserCircle size={48} className={`${colorModeContext} background-text-reverse-black opacity-40`} />
                <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200 text-center`}>
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
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <FaUserPlus size={48} className={`${colorModeContext} background-text-reverse-black opacity-40`} />
                <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-200 text-center`}>
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
