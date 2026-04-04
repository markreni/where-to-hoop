import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { deleteHoop, toggleHoopVerification, getHoopImageUrl, getProfileImageUrl, fetchUsersWithProfileImages, adminRemoveProfileImage } from '../services/requests'
import type { UserWithProfileImage } from '../services/requests'
import { BackArrow } from '../components/reusable/BackArrow'
import type { BasketballHoop, ColorMode } from '../types/types'
import { MdEdit, MdDelete, MdCheck, MdClose, MdVerified } from 'react-icons/md'
import { MdAdminPanelSettings } from 'react-icons/md'
import { GiBasketballBasket } from 'react-icons/gi'
import { FaUserCircle } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { conditionColorSelector } from '../utils/options'
import { Button } from 'react-aria-components'

type AdminTab = 'hoops' | 'profileImages'

const Admin = ({ hoops }: { hoops: BasketballHoop[] }) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState<AdminTab>('hoops')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteProfileId, setConfirmDeleteProfileId] = useState<string | null>(null)
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const { data: usersWithImages = [] } = useQuery<UserWithProfileImage[]>({
    queryKey: ['usersWithProfileImages'],
    queryFn: fetchUsersWithProfileImages,
    enabled: activeTab === 'profileImages',
  })

  const handleToggleVerification = async (hoop: BasketballHoop) => {
    try {
      await toggleHoopVerification(hoop.id, !hoop.isVerified)
      await queryClient.invalidateQueries({ queryKey: ['hoops'] })
      success(hoop.isVerified ? t('admin.hoopUnverified', { name: hoop.name }) : t('admin.hoopVerified', { name: hoop.name }))
    } catch {
      error(t('admin.hoopVerifyFailed'))
    }
  }

  const handleDelete = async (hoop: BasketballHoop) => {
    setDeletingId(hoop.id)
    try {
      await deleteHoop(hoop.id)
      await queryClient.invalidateQueries({ queryKey: ['hoops'] })
      success(t('admin.hoopDeleted', { name: hoop.name }))
    } catch {
      error(t('admin.hoopDeleteFailed'))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const handleDeleteProfileImage = async (user: UserWithProfileImage) => {
    setDeletingProfileId(user.id)
    try {
      await adminRemoveProfileImage(user.id, user.profileImage.imagePath)
      await queryClient.invalidateQueries({ queryKey: ['usersWithProfileImages'] })
      success(t('admin.profileImageDeleted'))
    } catch {
      error(t('admin.profileImageDeleteFailed'))
    } finally {
      setDeletingProfileId(null)
      setConfirmDeleteProfileId(null)
    }
  }

  return (
    <div className={`${colorModeContext} padding-for-back-arrow padding-x-for-page padding-b-for-page min-h-screen`}>
      <BackArrow />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <MdAdminPanelSettings size={32} className="text-first-color" />
          <h1 className={`${colorModeContext} poppins-bold text-fluid-2xl background-text`}>Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className={`${colorModeContext} flex gap-1 p-1 bg-third-color/20 dark:bg-white/10 rounded-lg mb-6`}>
          <Button
            onClick={() => setActiveTab('hoops')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'hoops'
                ? `${colorModeContext} bg-first-color background-text-reverse-black`
                : `${colorModeContext} background-text hover:text-first-color`
            }`}
          >
            <GiBasketballBasket size={16} />
            <span className="text-[10px] sm:text-fluid-sm">{t('admin.hoopsTab')}</span>
          </Button>
          <Button
            onClick={() => setActiveTab('profileImages')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'profileImages'
                ? `${colorModeContext} bg-first-color background-text-reverse-black`
                : `${colorModeContext} background-text hover:text-first-color`
            }`}
          >
            <FaUserCircle size={16} />
            <span className="text-[10px] sm:text-fluid-sm">{t('admin.profileImagesTab')}</span>
          </Button>
        </div>

        {/* Hoops Tab */}
        {activeTab === 'hoops' && (
          <>
            <div className="flex justify-end mb-2">
              <span className={`${colorModeContext} text-sm text-gray-700 dark:text-gray-200`}>{t('admin.hoopsTotal', { count: hoops.length })}</span>
            </div>
            <div className={`${colorModeContext} bg-background rounded-xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-fluid-sm">
                  <thead>
                    <tr className={`${colorModeContext} border-b border-gray-200 dark:border-gray-700 bg-gray-50 background-text font-semibold dark:bg-gray-800`}>
                      <th className="text-left px-4 py-3">{t('admin.image')}</th>
                      <th className="text-left px-4 py-3">{t('admin.name')}</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">{t('admin.condition')}</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">{t('admin.type')}</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">{t('admin.addedBy')}</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">{t('admin.created')}</th>
                      <th className="text-right px-4 py-3">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoops.map((hoop) => {
                      const imageSrc: string | null = hoop.images.length > 0
                        ? getHoopImageUrl(hoop.images[0].imagePath)
                        : null
                      const isConfirming = confirmDeleteId === hoop.id
                      const isDeleting = deletingId === hoop.id

                      return (
                        <tr
                          key={hoop.id}
                          className={`${colorModeContext} border-b border-gray-100 dark:border-gray-800 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors`}
                        >
                          {/* Thumbnail */}
                          <td className="px-4 py-3">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={hoop.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                            )}
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3">
                            <Link to={`/hoops/${hoop.id}`} className={`${colorModeContext} background-text font-medium hover:!text-first-color transition-colors`}>{hoop.name}</Link>
                            {hoop.address && (
                              <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{hoop.address}</p>
                            )}
                          </td>

                          {/* Condition */}
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${conditionColorSelector(hoop.condition)}`} />
                              <span className={`${colorModeContext} background-text capitalize`}>{hoop.condition}</span>
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`${colorModeContext} background-text`}>
                              {hoop.isIndoor ? t('admin.indoor') : t('admin.outdoor')}
                            </span>
                          </td>

                          {/* Added by */}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={`${colorModeContext} text-gray-500 dark:text-gray-400 text-xs`}>{hoop.addedBy}</span>
                          </td>

                          {/* Created at */}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={`${colorModeContext} text-gray-500 dark:text-gray-400 text-xs`}>
                              {new Date(hoop.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {isConfirming ? (
                                <>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{t('admin.confirmDelete')}</span>
                                  <Button
                                    onClick={() => handleDelete(hoop)}
                                    isDisabled={isDeleting}
                                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                                    aria-label="Confirm delete"
                                  >
                                    <MdCheck size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className={`${colorModeContext} p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 background-text hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
                                    aria-label="Cancel delete"
                                  >
                                    <MdClose size={16} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span title={hoop.isVerified ? t('admin.unverify') : t('admin.verify')}>
                                    <Button
                                      onClick={() => handleToggleVerification(hoop)}
                                      className={`${colorModeContext} p-1.5 rounded-lg transition-colors ${
                                        hoop.isVerified
                                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                      aria-label={hoop.isVerified ? t('admin.unverify') : t('admin.verify')}
                                    >
                                      <MdVerified size={16} />
                                    </Button>
                                  </span>
                                  <Button
                                    onClick={() => navigate(`/admin/edit/${hoop.id}`)}
                                    className={`${colorModeContext} p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors`}
                                    aria-label="Edit hoop"
                                  >
                                    <MdEdit size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmDeleteId(hoop.id)}
                                    className={`${colorModeContext} p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors`}
                                    aria-label="Delete hoop"
                                  >
                                    <MdDelete size={16} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {hoops.length === 0 && (
                  <div className={`${colorModeContext} text-center py-12 text-gray-600 dark:text-gray-200`}>
                    {t('admin.noHoops')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Images Tab */}
        {activeTab === 'profileImages' && (
          <>
            <div className="flex justify-end mb-2">
              <span className={`${colorModeContext} text-sm text-gray-700 dark:text-gray-200`}>
                {t('admin.profileImagesTotal', { count: usersWithImages.length })}
              </span>
            </div>
            <div className={`${colorModeContext} bg-background rounded-xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-fluid-sm">
                  <thead>
                    <tr className={`${colorModeContext} border-b border-gray-200 dark:border-gray-700 bg-gray-50 background-text font-semibold dark:bg-gray-800`}>
                      <th className="text-left px-4 py-3">{t('admin.image')}</th>
                      <th className="text-left px-4 py-3">{t('admin.player')}</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">{t('admin.uploadedAt')}</th>
                      <th className="text-right px-4 py-3">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithImages.map((user) => {
                      const imageSrc = getProfileImageUrl(user.profileImage.imagePath)
                      const isConfirming = confirmDeleteProfileId === user.id
                      const isDeleting = deletingProfileId === user.id

                      return (
                        <tr
                          key={user.id}
                          className={`${colorModeContext} border-b border-gray-100 dark:border-gray-800 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors`}
                        >
                          {/* Thumbnail */}
                          <td className="px-4 py-3">
                            <img
                              src={imageSrc}
                              alt={user.nickname}
                              className="w-12 h-12 object-cover rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setLightboxSrc(imageSrc)}
                            />
                          </td>

                          {/* Player nickname */}
                          <td className="px-4 py-3">
                            <Link
                              to={`/players/${user.nickname.toLowerCase()}`}
                              className={`${colorModeContext} background-text font-medium hover:!text-first-color transition-colors`}
                            >
                              {user.nickname}
                            </Link>
                          </td>

                          {/* Uploaded at */}
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`${colorModeContext} text-gray-500 dark:text-gray-400 text-xs`}>
                              {new Date(user.profileImage.uploadedAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {isConfirming ? (
                                <>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{t('admin.confirmDelete')}</span>
                                  <Button
                                    onClick={() => handleDeleteProfileImage(user)}
                                    isDisabled={isDeleting}
                                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                                    aria-label="Confirm delete"
                                  >
                                    <MdCheck size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmDeleteProfileId(null)}
                                    className={`${colorModeContext} p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 background-text hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
                                    aria-label="Cancel delete"
                                  >
                                    <MdClose size={16} />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => setConfirmDeleteProfileId(user.id)}
                                  className={`${colorModeContext} p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors`}
                                  aria-label="Delete profile image"
                                >
                                  <MdDelete size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {usersWithImages.length === 0 && (
                  <div className={`${colorModeContext} text-center py-12 text-gray-600 dark:text-gray-200`}>
                    {t('admin.noProfileImages')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lightbox for profile images */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center"
          onClick={() => setLightboxSrc(null)}
        >
          <Button
            onClick={() => setLightboxSrc(null)}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <IoMdClose size={28} />
          </Button>
          <img
            src={lightboxSrc}
            alt="Profile image"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default Admin
