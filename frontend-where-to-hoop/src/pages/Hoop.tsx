import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useLocationValues } from '../contexts/LocationContext'
import { useTranslation } from '../hooks/useTranslation'
import { useLocateHoop } from '../hooks/useLocateHoop'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import useIsAdmin from '../hooks/useIsAdmin'
import { useToast } from '../contexts/ToastContext'
import { BackArrow } from '../components/reusable/BackArrow'
import Footer from '../components/Footer'
import { HoopBadge } from '../components/reusable/HoopBadge'
import { HoopCardButton } from '../components/reusable/HoopCardButton'
import { EnrollmentForm } from '../components/EnrollmentForm'
import { PlayersPanel } from '../components/PlayersPanel'
import { MiniMap } from '../components/MiniMap'
import { ImageGallery } from '../components/reusable/ImageGallery'
import { MdOutlineFavoriteBorder, MdFavorite } from 'react-icons/md'
import { MdDeleteOutline, MdEditNote } from 'react-icons/md'
import type { BasketballHoop, ColorMode, Coordinates } from '../types/types'
import haversineDistance from '../utils/functions'
import { groupEnrollmentsByTime } from '../utils/enrollments'
import { fetchActiveHoopEnrollments, deleteHoop } from '../services/requests'
import { useFavorites } from '../hooks/useFavorites'
import { Button } from 'react-aria-components'
import { useMediaQuery } from 'usehooks-ts'
import breakpoints from '../assets/style'
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
  const locateHoop = useLocateHoop(hoop?.coordinates)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isAdmin } = useIsAdmin()
  const { isFavorited, toggleFavorite } = useFavorites()
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const md = useMediaQuery(`(min-width: ${breakpoints.md})`)

  const { data: hoopEnrollments = [] } = useQuery({
    queryKey: ['enrollments', hoop?.id ?? ''],
    queryFn: () => fetchActiveHoopEnrollments(hoop?.id ?? ''),
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

  const { playingNow } = groupEnrollmentsByTime(hoopEnrollments)
  const playingNowCount = playingNow.length


  const handleDelete = async () => {
    if (!window.confirm(`Delete "${hoop.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteHoop(hoop.id)
      await queryClient.invalidateQueries({ queryKey: ['hoops'] })
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
      {isAdmin && (
        <div className={`${colorModeContext} fixed z-1002 top-20 right-2 flex items-center gap-1 bg-background rounded-full shadow-md px-2 py-1 border-2 border-label-component`}>
          <Button
            onClick={() => navigate(`/admin/edit/${hoop.id}`)}
            className={`${colorModeContext} p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 cursor-pointer transition-colors`}
            aria-label="Edit hoop"
            //title="Edit hoop"
          >
            <MdEditNote size={22} />
          </Button>
          <Button
            onClick={handleDelete}
            isDisabled={deleting}
            className={`${colorModeContext} p-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 cursor-pointer transition-colors disabled:opacity-50`}
            aria-label="Delete hoop"
            //title="Delete hoop"
          >
            <MdDeleteOutline size={22} />
          </Button>
        </div>
      )}
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className="max-w-5xl mx-auto">
          {/* Two column layout on desktop */}
          <div className="grid grid-cols-1 xmd:grid-cols-2 gap-6">
            {/* Right column - Players and enrollment */}
            <div className="flex flex-col gap-6">
              {/* Left column - Hoop info */}
              <div className={`${colorModeContext} bg-background rounded-lg shadow-lg p-4 sm:p-6`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <h1 className={`${colorModeContext} text-fluid-xl poppins-bold leading-tight background-text break-words`}>
                      {hoop.name}
                    </h1>
                     {/* Badges */}
                    <div className="flex flex-wrap gap-1">
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
                      {hoop.isVerified && (
                        <HoopBadge
                          variant="verified"
                          text={t('common.verified')}
                          showIcon={true}
                          textClassName='responsive-hoopcard-elements-text'
                          tooltip={t('hoops.tooltips.verified')}
                        />
                      )}
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
                  {user && (
                    <div className="shrink-0">
                      {isFavorited(hoop.id)
                        ? <MdFavorite className="text-red-500 cursor-pointer transition-colors" size={md ? 30 : 26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>
                        : <MdOutlineFavoriteBorder className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" size={md ? 30 : 26} onClick={() => toggleFavorite(hoop.id)} aria-label={t('hoops.tooltips.addToFavorites')} title={t('hoops.tooltips.addToFavorites')}/>}
                    </div>
                  )}
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
                    <p className={`${colorModeContext} background-text-black text-fluid-xs`}>{hoop.address ?? t('common.noAddress')}</p>
                      {distance !== null && (
                    <p className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
                      {distance.toFixed(1)} km
                    </p>
                    )}
                  </div>

                  {/* Location map */}
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-[1000]">
                      <HoopCardButton actionFunction={locateHoop} title={t('hoops.hoopcardMapButton')} colors="hoop-card-button-blue" text="text-sm" />
                    </div>
                    <MiniMap
                      coordinates={hoop.coordinates}
                      mapRef={mapRef}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <EnrollmentForm
                hoopId={hoop.id}
                enrollments={hoopEnrollments}
              />
            </div>
            <PlayersPanel
              hoopEnrollments={hoopEnrollments}
              hoopCoordinates={hoop.coordinates}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hoop
