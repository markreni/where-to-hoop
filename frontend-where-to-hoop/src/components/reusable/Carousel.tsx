import { useState, useEffect, type ReactNode } from "react";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import { useColorModeValues } from "../../contexts/ColorModeContext";
import { useSwipeDrag } from "../../hooks/useSwipeDrag";

interface CarouselProps {
  children: ReactNode[];
  className?: string;
}

export const Carousel = ({ children, className = "" }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colorModeContext = useColorModeValues();
  const itemCount = children.length;

  const {
    containerRef,
    isDragging,
    isTransitioning,
    dragOffset,
    translateX,
    goTo,
    goNext,
    goPrev,
    handlers,
  } = useSwipeDrag({ itemCount, currentIndex, onIndexChange: setCurrentIndex });

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
  }, [containerRef, goNext, goPrev]);

  // Determine fade visibility
  const showLeftFade = currentIndex > 0 || dragOffset < 0;
  const showRightFade = currentIndex < itemCount - 1 || dragOffset > 0;

  return (
    <div className={`relative mx-auto max-w-md xsm:max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl ${className}`}>
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
            ${showLeftFade ? 'transparent 0%, black 12px' : 'black 0%'},
            black calc(100% - 12px),
            ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
          WebkitMaskImage: `linear-gradient(to right,
            ${showLeftFade ? 'transparent 0%, black 12px' : 'black 0%'},
            black calc(100% - 12px),
            ${showRightFade ? 'transparent 100%' : 'black 100%'})`,
        }}
      >
        <div
          className={`flex ${isTransitioning && !isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{
            transform: `translateX(${translateX}%)`,
          }}
          {...handlers}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-2"
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
            className={`${colorModeContext} hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-background background-text transition-all z-10 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'background-hover hover:scale-110'
            }`}
          >
            <IoArrowBackSharp size={24} />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === itemCount - 1}
            aria-label="Next slide"
            className={`${colorModeContext} hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-background background-text transition-all z-10 ${
              currentIndex === itemCount - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'background-hover hover:scale-110'
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
            className={`${colorModeContext} md:hidden p-2 rounded-full bg-background background-text transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'background-hover-gray active:scale-95'
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
                className={`${colorModeContext} h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? `bg-background w-6`
                    : `bg-fourth-color dark:bg-third-color w-2 hover:bg-gray-500`
                }`}
              />
            ))}
          </div>

          {/* Mobile next arrow */}
          <button
            onClick={goNext}
            disabled={currentIndex === itemCount - 1}
            aria-label="Next slide"
            className={`${colorModeContext} md:hidden p-2 rounded-full bg-background background-text transition-all ${
              currentIndex === itemCount - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'background-hover-gray active:scale-95'
            }`}
          >
            <IoArrowForwardSharp size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
