import { useMemo } from 'react'
import { useColorModeValues } from '../contexts/DarkModeContext'
import { useLocationValues } from '../contexts/LocationContext'
import { useTranslation } from '../hooks/useTranslation'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import { HoopBadge } from '../components/reusable/HoopBadge'
import { EnrollmentForm } from '../components/EnrollmentForm'
import { PlayersPanel } from '../components/PlayersPanel'
import { MdOutlineFavoriteBorder } from 'react-icons/md'
import type { BasketballHoop, ColorMode, Coordinates } from '../types/types'
import haversineDistance from '../utils/functions'

interface HoopProps {
  hoop: BasketballHoop | undefined
}

// Main Hoop page component
const Hoop = ({ hoop }: HoopProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const userLocation: Coordinates = useLocationValues()

  // Calculate distance
  const distance: number | null = useMemo(() => {
    if (!hoop || !userLocation.latitude || !userLocation.longitude) return null
    return haversineDistance(
      [userLocation.latitude, userLocation.longitude],
      [hoop.coordinates.latitude!, hoop.coordinates.longitude!],
    )
  }, [hoop, userLocation])

  if (!hoop) {
    return (
      <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
        <BackArrow />
        <div className="flex-grow padding-x-for-page padding-b-for-page flex items-center justify-center">
          <p className={`${colorModeContext} text-fluid-lg background-text`}>Hoop not found</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-5xl mx-auto">
          {/* Two column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Right column - Players and enrollment */}
            <div className="flex flex-col gap-6">
              {/* Left column - Hoop info */}
              <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className={`${colorModeContext} text-fluid-xl poppins-bold background-text`}>
                        {hoop.name}
                      </h1>
                      <MdOutlineFavoriteBorder className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" size={26} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
                    </div>
                    {distance !== null && (
                      <p className={`${colorModeContext} text-fluid-sm text-gray-500 dark:text-gray-400`}>
                        {distance.toFixed(1)} km
                      </p>
                    )}
                  </div>
                </div>

                {/* Image */}
                <img
                  className="rounded-lg w-full h-48 sm:h-64 object-cover mb-4"
                  src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/400x300'}
                  alt={hoop.name}
                />

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <HoopBadge
                    variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
                    text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
                    showIcon={true}
                    tooltip={t('hoops.tooltips.courtType')}
                  />
                  <HoopBadge
                    variant="condition"
                    condition={hoop.condition}
                    text={t(`common.condition.${hoop.condition}`)}
                    tooltip={t('hoops.tooltips.condition')}
                  />
                  <HoopBadge
                    variant="date"
                    text={new Date(hoop.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    showIcon={true}
                    tooltip={t('hoops.tooltips.dateAdded')}
                  />
                </div>

                {/* Description */}
                <p className={`${colorModeContext} text-fluid-base background-text`}>
                  {hoop.description}
                </p>
              </div>
              <EnrollmentForm
                hoopId={hoop.id}
              />
            </div>
            <PlayersPanel
                playerEnrollments={hoop.playerEnrollments}
              />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hoop
