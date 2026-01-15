import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";

interface CarouselProps {
  children: ReactNode[];
  className?: string;
}

export const Carousel = ({ children, className = "" }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);
  const itemCount = children.length;

  const goTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
  }, [itemCount]);

  const goNext = useCallback(() => {
    if (currentIndex < itemCount - 1) {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, itemCount, goTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      time: Date.now(),
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartRef.current.x;

    // Add resistance at edges
    let adjustedDiff = diff;
    if ((currentIndex === 0 && diff > 0) || (currentIndex === itemCount - 1 && diff < 0)) {
      adjustedDiff = diff * 0.3;
    }

    setDragOffset(adjustedDiff);
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const swipeThreshold = containerWidth * 0.2;
    const velocity = dragOffset / (Date.now() - touchStartRef.current.time);

    // Determine if swipe should trigger navigation
    const shouldNavigate = Math.abs(dragOffset) > swipeThreshold || Math.abs(velocity) > 0.5;

    if (shouldNavigate) {
      if (dragOffset > 0 && currentIndex > 0) {
        goPrev();
      } else if (dragOffset < 0 && currentIndex < itemCount - 1) {
        goNext();
      } else {
        // Bounce back
        setIsTransitioning(true);
        setDragOffset(0);
      }
    } else {
      // Snap back
      setIsTransitioning(true);
      setDragOffset(0);
    }

    setIsDragging(false);
    touchStartRef.current = null;
  };

  // Mouse drag handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    e.preventDefault();
    touchStartRef.current = {
      x: e.clientX,
      time: Date.now(),
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartRef.current || !isDragging) return;

    const currentX = e.clientX;
    const diff = currentX - touchStartRef.current.x;

    let adjustedDiff = diff;
    if ((currentIndex === 0 && diff > 0) || (currentIndex === itemCount - 1 && diff < 0)) {
      adjustedDiff = diff * 0.3;
    }

    setDragOffset(adjustedDiff);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  // Calculate transform
  const translateX = -(currentIndex * 100) + (dragOffset / (containerRef.current?.offsetWidth || 300)) * 100;

  // Determine fade visibility
  const showLeftFade = currentIndex > 0 || dragOffset < 0;
  const showRightFade = currentIndex < itemCount - 1 || dragOffset > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Carousel track */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        tabIndex={0}
        role="region"
        aria-label="Carousel"
        aria-roledescription="carousel"
        style={{
          maskImage: `linear-gradient(to right,
            ${showLeftFade ? 'transparent 0%, black 24px' : 'black 0%'},
            black calc(100% - 24px),
            ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
          WebkitMaskImage: `linear-gradient(to right,
            ${showLeftFade ? 'transparent 0%, black 24px' : 'black 0%'},
            black calc(100% - 24px),
            ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
        }}
      >
        <div
          className={`flex ${isTransitioning && !isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{
            transform: `translateX(${translateX}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTransitionEnd={handleTransitionEnd}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-3"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${itemCount}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - visible on sm+ */}
      {itemCount > 1 && (
        <>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-first-color text-white transition-all z-10 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-second-color hover:scale-110'
            }`}
          >
            <IoArrowBackSharp size={24} />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === itemCount - 1}
            aria-label="Next slide"
            className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-first-color text-white transition-all z-10 ${
              currentIndex === itemCount - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-second-color hover:scale-110'
            }`}
          >
            <IoArrowForwardSharp size={24} />
          </button>
        </>
      )}

      {/* Navigation dots + mobile arrows */}
      {itemCount > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          {/* Mobile prev arrow */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            className={`sm:hidden p-2 rounded-full bg-first-color text-white transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-second-color active:scale-95'
            }`}
          >
            <IoArrowBackSharp size={20} />
          </button>

          {/* Dots */}
          <div className="flex gap-2" role="tablist" aria-label="Carousel navigation">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-first-color w-6"
                    : "bg-gray-400 dark:bg-gray-600 w-2 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          {/* Mobile next arrow */}
          <button
            onClick={goNext}
            disabled={currentIndex === itemCount - 1}
            aria-label="Next slide"
            className={`sm:hidden p-2 rounded-full bg-first-color text-white transition-all ${
              currentIndex === itemCount - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-second-color active:scale-95'
            }`}
          >
            <IoArrowForwardSharp size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
