import { useState, useEffect, useCallback, useRef } from 'react'
import { IoArrowBackSharp, IoArrowForwardSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import { useColorModeValues } from '../../contexts/ColorModeContext'
import { getHoopImageUrl } from '../../services/requests'
import type { ObservationImage } from '../../types/types'

interface ImageGalleryProps {
  images: ObservationImage[]
  name: string
}

export const ImageGallery = ({ images, name }: ImageGalleryProps) => {
  const colorModeContext = useColorModeValues()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; time: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const itemCount = images.length

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, itemCount - 1))
    setIsTransitioning(true)
    setSelectedIndex(clamped)
    setDragOffset(0)
  }, [itemCount])

  const goNext = useCallback(() => {
    if (selectedIndex < itemCount - 1) goTo(selectedIndex + 1)
  }, [selectedIndex, itemCount, goTo])

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) goTo(selectedIndex - 1)
  }, [selectedIndex, goTo])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return
    touchStartRef.current = { x: e.touches[0].clientX, time: Date.now() }
    hasDraggedRef.current = false
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isDragging) return
    const diff = e.touches[0].clientX - touchStartRef.current.x
    if (Math.abs(diff) > 5) hasDraggedRef.current = true
    let adjusted = diff
    if ((selectedIndex === 0 && diff > 0) || (selectedIndex === itemCount - 1 && diff < 0)) {
      adjusted = diff * 0.3
    }
    setDragOffset(adjusted)
  }

  const finishDrag = () => {
    if (!touchStartRef.current || !isDragging) return
    const containerWidth = containerRef.current?.offsetWidth || 300
    const swipeThreshold = containerWidth * 0.2
    const velocity = dragOffset / (Date.now() - touchStartRef.current.time)
    const shouldNavigate = Math.abs(dragOffset) > swipeThreshold || Math.abs(velocity) > 0.5

    if (shouldNavigate) {
      if (dragOffset > 0 && selectedIndex > 0) goPrev()
      else if (dragOffset < 0 && selectedIndex < itemCount - 1) goNext()
      else { setIsTransitioning(true); setDragOffset(0) }
    } else {
      setIsTransitioning(true)
      setDragOffset(0)
    }
    setIsDragging(false)
    touchStartRef.current = null
  }

  const handleTouchEnd = () => finishDrag()

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return
    e.preventDefault()
    touchStartRef.current = { x: e.clientX, time: Date.now() }
    hasDraggedRef.current = false
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartRef.current || !isDragging) return
    const diff = e.clientX - touchStartRef.current.x
    if (Math.abs(diff) > 5) hasDraggedRef.current = true
    let adjusted = diff
    if ((selectedIndex === 0 && diff > 0) || (selectedIndex === itemCount - 1 && diff < 0)) {
      adjusted = diff * 0.3
    }
    setDragOffset(adjusted)
  }

  const handleMouseUp = () => { if (isDragging) finishDrag() }
  const handleMouseLeave = () => { if (isDragging) finishDrag() }
  const handleTransitionEnd = () => setIsTransitioning(false)

  // Click to open lightbox (only if not dragging)
  const handleImageClick = () => {
    if (hasDraggedRef.current || images.length === 0) return
    setLightboxIndex(selectedIndex)
    setLightboxOpen(true)
  }

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

  const translateX = -(selectedIndex * 100) + (dragOffset / (containerRef.current?.offsetWidth || 300)) * 100
  const showLeftFade = selectedIndex > 0 || dragOffset < 0
  const showRightFade = selectedIndex < itemCount - 1 || dragOffset > 0

  const mainSrc = images.length > 0
    ? getHoopImageUrl(images[selectedIndex].imagePath)
    : 'https://via.placeholder.com/400x300'

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main image — swipeable if multiple images */}
        {images.length > 1 ? (
          <div
            ref={containerRef}
            className="overflow-hidden rounded-lg"
            style={{
              maskImage: `linear-gradient(to right,
                ${showLeftFade ? 'transparent 0%, black 0px' : 'black 0%'},
                black calc(100% - 0px),
                ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
              WebkitMaskImage: `linear-gradient(to right,
                ${showLeftFade ? 'transparent 0%, black 0px' : 'black 0%'},
                black calc(100% - 0px),
                ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
            }}
          >
            <div
              className={`flex ${isTransitioning && !isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
              style={{ transform: `translateX(${translateX}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTransitionEnd={handleTransitionEnd}
            >
              {images.map((img, i) => (
                <img
                  key={img.id}
                  className="w-full flex-shrink-0 h-48 sm:h-64 object-cover cursor-pointer select-none"
                  src={getHoopImageUrl(img.imagePath)}
                  alt={`${name} ${i + 1}`}
                  draggable={false}
                  onClick={handleImageClick}
                />
              ))}
            </div>
          </div>
        ) : (
          <img
            className={`rounded-lg w-full h-48 sm:h-64 object-cover ${images.length > 0 ? 'cursor-pointer' : ''}`}
            src={mainSrc}
            alt={name}
            onClick={openLightbox}
          />
        )}

        {/* Thumbnail strip — only if more than 1 image */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => goTo(i)}
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
          className="fixed inset-0 z-[9999] bg-black/85 flex flex-col items-center justify-center min-w-[340px]"
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
