import { useState, useEffect, useCallback } from 'react'
import { IoArrowBackSharp, IoArrowForwardSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { getHoopImageUrl } from '../../utils/requests'
import type { ObservationImage } from '../../types/types'

interface ImageGalleryProps {
  images: ObservationImage[]
  name: string
}

export const ImageGallery = ({ images, name }: ImageGalleryProps) => {
  const colorModeContext = useColorModeValues()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = () => {
    if (images.length === 0) return
    setLightboxIndex(selectedIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const lightboxPrev = useCallback(() => {
    setLightboxIndex(i => Math.max(0, i - 1))
  }, [])

  const lightboxNext = useCallback(() => {
    setLightboxIndex(i => Math.min(images.length - 1, i + 1))
  }, [images.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  const mainSrc = images.length > 0
    ? getHoopImageUrl(images[selectedIndex].imagePath)
    : 'https://via.placeholder.com/400x300'

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main image */}
        <img
          className={`rounded-lg w-full h-48 sm:h-64 object-cover ${images.length > 0 ? 'cursor-pointer' : ''}`}
          src={mainSrc}
          alt={name}
          onClick={openLightbox}
        />

        {/* Thumbnail strip — only if more than 1 image */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`flex-shrink-0 rounded overflow-hidden transition-all ${
                  i === selectedIndex
                    ? 'ring-2 ring-[#F88158] opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={getHoopImageUrl(img.imagePath)}
                  alt={`${name} ${i + 1}`}
                  className="h-14 w-14 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
            {images.length > 1 ? (
              <span className="text-white text-sm font-medium">
                {lightboxIndex + 1} / {images.length}
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <IoMdClose size={28} />
            </button>
          </div>

          {/* Image + side arrows */}
          <div
            className="relative flex items-center justify-center w-full max-w-4xl px-4"
            onClick={e => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={lightboxPrev}
                disabled={lightboxIndex === 0}
                aria-label="Previous image"
                className={`${colorModeContext} absolute left-2 z-10 p-2 rounded-full bg-white/10 text-white transition-all ${
                  lightboxIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/25'
                }`}
              >
                <IoArrowBackSharp size={24} />
              </button>
            )}

            <img
              src={getHoopImageUrl(images[lightboxIndex].imagePath)}
              alt={`${name} ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />

            {images.length > 1 && (
              <button
                onClick={lightboxNext}
                disabled={lightboxIndex === images.length - 1}
                aria-label="Next image"
                className={`${colorModeContext} absolute right-2 z-10 p-2 rounded-full bg-white/10 text-white transition-all ${
                  lightboxIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/25'
                }`}
              >
                <IoArrowForwardSharp size={24} />
              </button>
            )}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div
              className="flex gap-2 mt-4"
              onClick={e => e.stopPropagation()}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === lightboxIndex ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
