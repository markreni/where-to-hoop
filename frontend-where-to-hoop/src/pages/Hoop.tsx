import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useLocationValues } from '../contexts/LocationContext'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import useIsAdmin from '../hooks/useIsAdmin'
import { useToast } from '../contexts/ToastContext'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import { HoopBadge } from '../components/reusable/HoopBadge'
import { EnrollmentForm } from '../components/EnrollmentForm'
import { PlayersPanel } from '../components/PlayersPanel'
import { MiniMap } from '../components/MiniMap'
import { ImageGallery } from '../components/reusable/ImageGallery'
import { MdOutlineFavoriteBorder, MdFavorite } from 'react-icons/md'
import { MdDeleteOutline, MdEditNote } from 'react-icons/md'
import type { BasketballHoop, ColorMode, Coordinates } from '../types/types'
import haversineDistance, { groupEnrollmentsByTime } from '../utils/functions'
import { fetchHoopEnrollments, deleteHoop } from '../utils/requests'
import { useFavorites } from '../hooks/useFavorites'
import { Button } from 'react-aria-components'
import L from 'leaflet'

interface HoopProps {
  hoop: BasketballHoop | undefined
}

// Main Hoop page component
const Hoop = ({ hoop }: HoopProps) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const { t } = useTranslation()
  const language = useLanguage()
  const userLocation: Coordinates = useLocationValues()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isAdmin } = useIsAdmin()
  const { isFavorited, toggleFavorite } = useFavorites()
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', hoop?.id ?? ''],
    queryFn: () => fetchHoopEnrollments(hoop?.id ?? ''),
    enabled: !!hoop,
  })

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

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

  const { playingNow } = groupEnrollmentsByTime(enrollments)
  const playingNowCount = playingNow.length


  const handleDelete = async () => {
    if (!window.confirm(`Delete "${hoop.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteHoop(hoop.id)
      queryClient.invalidateQueries({ queryKey: ['hoops'] })
      success('Hoop deleted')
      navigate('/hoops')
    } catch {
      error('Failed to delete hoop')
      setDeleting(false)
    }
  }

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-5xl mx-auto">
          {/* Two column layout on desktop */}
          <div className="grid grid-cols-1 xmd:grid-cols-2 gap-6">
            {/* Right column - Players and enrollment */}
            <div className="relative flex flex-col gap-6">
              {/* Left column - Hoop info */}
              <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                      <h1 className={`${colorModeContext} text-fluid-xl poppins-bold background-text`}>
                        {hoop.name}
                      </h1>
                      {user && (
                        isFavorited(hoop.id)
                          ? <MdFavorite className="text-red-500 cursor-pointer transition-colors" size={26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
                          : <MdOutlineFavoriteBorder className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" size={26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
                      )}
                      {isAdmin && (
                        <div className="absolute right-2 top-2 flex items-center gap-3 xsm:gap-6">
                          <button
                            onClick={() => navigate(`/admin/edit/${hoop.id}`)}
                            className="text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                            aria-label="Edit hoop"
                            title="Edit hoop"
                          >
                            <MdEditNote size={26} />
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                            aria-label="Delete hoop"
                            title="Delete hoop"
                          >
                            <MdDeleteOutline size={26} />
                          </button>
                        </div>
                      )}
                    </div>
                     {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <HoopBadge
                        variant={hoop.isIndoor ? 'indoor' : 'outdoor'}
                        text={hoop.isIndoor ? t('common.indoor') : t('common.outdoor')}
                        showIcon={true}
                        textClassName='responsive-hoopcard-elements-text'
                        tooltip={t('hoops.tooltips.courtType')}
                      />
                      <HoopBadge
                        variant="condition"
                        textClassName='responsive-hoopcard-elements-text'
                        condition={hoop.condition}
                        text={t(`common.condition.${hoop.condition}`)}
                        tooltip={t('hoops.tooltips.condition')}
                      />
                      <HoopBadge
                        variant={hoop.isPaid ? 'paid' : 'free'}
                        text={hoop.isPaid ? t('common.paid') : t('common.free')}
                        showIcon={true}
                        textClassName='responsive-hoopcard-elements-text'
                        tooltip={t('hoops.tooltips.courtAccess')}
                      />
                      {/*
                      <HoopBadge
                        variant="date"
                        text={new Date(hoop.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        showIcon={true}
                        textClassName='responsive-hoopcard-elements-text'
                        tooltip={t('hoops.tooltips.dateAdded')}
                      />
                      */}

                      <Button className="p-0 cursor-pointer" onPress={() => navigate(`/hoops/${hoop.id}#players`)} aria-label={t('hoops.tooltips.currentPlayers')}>
                        <HoopBadge
                          variant="players"
                          text={
                            playingNowCount === 1
                              ? t('hoops.players.one')
                              : t('hoops.players.other', { count: playingNowCount > 99 ? '>99' : playingNowCount })
                          }
                          showIcon={true}
                          textClassName="responsive-hoopcard-elements-text"
                          tooltip={t('hoops.tooltips.currentPlayers')}
                          capitalize={false}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  {/* Image gallery */}
                  <ImageGallery images={hoop.images} name={hoop.name} />

                  {/* Description */} {/* distance + address used to be placed */}
                  <p className={`${colorModeContext} font-thin responsive-hoopcard-elements-text background-text`}>
                    {hoop.description[language] || hoop.description.en || hoop.description.fi}
                  </p>
                </div>

                <div className='flex flex-col gap-0'>
                  <div className="flex items-center gap-x-4 gap-y-0 flex-wrap">
                    <p className={`${colorModeContext} background-text-black text-fluid-xs`}>{hoop.address??'No address is specified'}</p>
                      {distance !== null && (
                    <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
                      {distance.toFixed(1)} km
                    </p>
                    )}
                  </div>

                  {/* Location map */}
                  <MiniMap
                    coordinates={hoop.coordinates}
                    mapRef={mapRef}
                    readOnly
                  />
                </div>
              </div>
              <EnrollmentForm
                hoopId={hoop.id}
                enrollments={enrollments}
              />
            </div>
            <PlayersPanel
              playerEnrollments={enrollments}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hoop
