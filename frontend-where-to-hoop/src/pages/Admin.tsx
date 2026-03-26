import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useColorModeValues } from '../contexts/ColorModeContext'
import { useToast } from '../contexts/ToastContext'
import { deleteHoop, getHoopImageUrl } from '../utils/requests'
import { BackArrow } from '../components/reusable/BackArrow'
import type { BasketballHoop, ColorMode } from '../types/types'
import { MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md'
import { MdAdminPanelSettings } from 'react-icons/md'
import { conditionColorSelector } from '../utils/options'

const Admin = ({ hoops }: { hoops: BasketballHoop[] }) => {
  const colorModeContext: ColorMode = useColorModeValues()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (hoop: BasketballHoop) => {
    setDeletingId(hoop.id)
    try {
      await deleteHoop(hoop.id)
      await queryClient.invalidateQueries({ queryKey: ['hoops'] })
      success(`"${hoop.name}" deleted.`)
    } catch {
      error('Failed to delete hoop.')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
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
          <span className={`${colorModeContext} ml-auto text-sm text-gray-700 dark:text-gray-200`}>{hoops.length} hoops total</span>
        </div>

        {/* Table */}
        <div className={`${colorModeContext} bg-background rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead>
                <tr className={`${colorModeContext} border-b border-gray-200 dark:border-gray-700 bg-gray-50 background-text font-semibold dark:bg-gray-800`}>
                  <th className="text-left px-4 py-3">Image</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Condition</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Added by</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Created</th>
                  <th className="text-right px-4 py-3">Actions</th>
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
                        <span className={`${colorModeContext} background-text font-medium`}>{hoop.name}</span>
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
                          {hoop.isIndoor ? 'Indoor' : 'Outdoor'}
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
                              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Delete?</span>
                              <button
                                onClick={() => handleDelete(hoop)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                                aria-label="Confirm delete"
                              >
                                <MdCheck size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className={`${colorModeContext} p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 background-text hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
                                aria-label="Cancel delete"
                              >
                                <MdClose size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/admin/edit/${hoop.id}`)}
                                className={`${colorModeContext} p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors`}
                                aria-label="Edit hoop"
                              >
                                <MdEdit size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(hoop.id)}
                                className={`${colorModeContext} p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors`}
                                aria-label="Delete hoop"
                              >
                                <MdDelete size={16} />
                              </button>
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
                No hoops found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
