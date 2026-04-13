import { useState, useCallback, useRef } from 'react'

interface UseSwipeDragOptions {
  itemCount: number
  currentIndex: number
  onIndexChange: (index: number) => void
}

export const useSwipeDrag = ({ itemCount, currentIndex, onIndexChange }: UseSwipeDragOptions) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; time: number } | null>(null)
  const hasDraggedRef = useRef(false)

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, itemCount - 1))
    setIsTransitioning(true)
    onIndexChange(clamped)
    setDragOffset(0)
  }, [itemCount, onIndexChange])

  const goNext = useCallback(() => {
    if (currentIndex < itemCount - 1) goTo(currentIndex + 1)
  }, [currentIndex, itemCount, goTo])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }, [currentIndex, goTo])

  const applyEdgeResistance = (diff: number) => {
    if ((currentIndex === 0 && diff > 0) || (currentIndex === itemCount - 1 && diff < 0)) {
      return diff * 0.3
    }
    return diff
  }

  const finishDrag = () => {
    if (!touchStartRef.current || !isDragging) return
    const containerWidth = containerRef.current?.offsetWidth || 300
    const swipeThreshold = containerWidth * 0.2
    const velocity = dragOffset / (Date.now() - touchStartRef.current.time)
    const shouldNavigate = Math.abs(dragOffset) > swipeThreshold || Math.abs(velocity) > 0.5

    if (shouldNavigate) {
      if (dragOffset > 0 && currentIndex > 0) goPrev()
      else if (dragOffset < 0 && currentIndex < itemCount - 1) goNext()
      else { setIsTransitioning(true); setDragOffset(0) }
    } else {
      setIsTransitioning(true)
      setDragOffset(0)
    }
    setIsDragging(false)
    touchStartRef.current = null
  }

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
    setDragOffset(applyEdgeResistance(diff))
  }

  const handleTouchEnd = () => finishDrag()

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
    setDragOffset(applyEdgeResistance(diff))
  }

  const handleMouseUp = () => { if (isDragging) finishDrag() }
  const handleMouseLeave = () => { if (isDragging) finishDrag() }
  const handleTransitionEnd = () => setIsTransitioning(false)

  const translateX = -(currentIndex * 100) + (dragOffset / (containerRef.current?.offsetWidth || 300)) * 100

  return {
    containerRef,
    isDragging,
    isTransitioning,
    dragOffset,
    translateX,
    hasDragged: () => hasDraggedRef.current,
    goTo,
    goNext,
    goPrev,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTransitionEnd: handleTransitionEnd,
    },
  }
}
