import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useLocationValues } from '../contexts/LocationContext'
import { BackArrow } from '../components/reusable/BackArrow'
import { EnrollmentCard } from '../components/reusable/EnrollmentCard'
import { HoopCard } from '../components/reusable/HoopCard'
import Footer from '../components/Footer'
import { fetchUserEnrollments, fetchAllEnrollments } from '../utils/requests'
import { useFavorites } from '../hooks/useFavorites'
import { groupEnrollmentsByHoop } from '../utils/functions'
import haversineDistance from '../utils/functions'
import type { BasketballHoop, ColorMode, Coordinates, PlayerEnrollment } from '../types/types'
import { MdOutlineFavoriteBorder } from 'react-icons/md'
import { GiBasketballBasket } from 'react-icons/gi'

interface MyProfileProps {
  hoops: BasketballHoop[]
}

type Tab = 'enrollments' | 'favorites'

const MyProfile = ({ hoops }: MyProfileProps) => {
  const { user } = useAuth()
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const userLocation: Coordinates = useLocationValues()
  const [activeTab, setActiveTab] = useState<Tab>('enrollments')
  const { favoriteIds } = useFavorites()

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

  if (!user) return <Navigate to="/signin" replace />

  const now = new Date()
  const upcoming: PlayerEnrollment[] = enrollments
    .filter(e => e.arrivalTime >= now)
    .sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime())
  const past: PlayerEnrollment[] = enrollments
    .filter(e => e.arrivalTime < now)
    .sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime())

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text-black`}>
              {user.user_metadata?.nickname ?? user.email}
            </h1>
            <p className={`${colorModeContext} text-fluid-sm background-text-reverse-black`}>
              {user.email}
            </p>
          </div>

          {/* Tabs */}
          <div className={`${colorModeContext} flex gap-1 p-1 bg-third-color/20 dark:bg-white/10 rounded-lg mb-6`}>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-fluid-sm font-medium transition-colors ${
                activeTab === 'enrollments'
                  ? `${colorModeContext} bg-first-color background-text-reverse-black`
                  : `${colorModeContext} background-text hover:text-first-color`
              }`}
            >
              <GiBasketballBasket size={16} />
              {t('myProfile.enrollmentsTab')}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-fluid-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? `${colorModeContext} bg-first-color background-text-reverse-black`
                  : `${colorModeContext} background-text hover:text-first-color`
              }`}
            >
              <MdOutlineFavoriteBorder size={16} />
              {t('myProfile.favoritesTab')}
            </button>
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

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyProfile
