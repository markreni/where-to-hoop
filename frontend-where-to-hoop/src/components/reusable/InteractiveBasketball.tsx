import { useState, useRef, useEffect, useCallback } from "react";
import { GiBasketballBall } from "react-icons/gi";

interface InteractiveBasketballProps {
  size?: number;
  className?: string;
  boundsRef?: React.RefObject<HTMLElement | null>;
}

export const InteractiveBasketball = ({
  size = 40,
  className = "text-first-color",
  boundsRef,
}: InteractiveBasketballProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const ballRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const clampToBounds = useCallback(
    (x: number, y: number) => {
      if (!boundsRef?.current || !ballRef.current) {
        return { x, y };
      }

      const bounds = boundsRef.current.getBoundingClientRect();
      const ball = ballRef.current.getBoundingClientRect();

      // Calculate the initial center position of the ball
      const initialCenterX = ball.left - position.x + ball.width / 2;
      const initialCenterY = ball.top - position.y + ball.height / 2;

      // Calculate max offsets from initial position
      const maxLeft = bounds.left - initialCenterX + size / 2 + 8;
      const maxRight = bounds.right - initialCenterX - size / 2 - 8;
      const maxTop = bounds.top - initialCenterY + size / 2 + 8;
      const maxBottom = bounds.bottom - initialCenterY - size / 2 - 8;

      return {
        x: Math.max(maxLeft, Math.min(maxRight, x)),
        y: Math.max(maxTop, Math.min(maxBottom, y)),
      };
    },
    [boundsRef, size, position.x, position.y]
  );

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position.x, position.y]
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !dragStartRef.current) return;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const newX = dragStartRef.current.posX + deltaX;
      const newY = dragStartRef.current.posY + deltaY;

      const clamped = clampToBounds(newX, newY);
      setPosition(clamped);

      // Rotation based on horizontal movement
      setRotation((prev) => prev + deltaX * 0.5);
    },
    [isDragging, clampToBounds]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    // Spring back to center
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Global move and up listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      ref={ballRef}
      className="cursor-grab active:cursor-grabbing select-none"
      style={{
        touchAction: "none",
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging
          ? "none"
          : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <GiBasketballBall size={size} className={className} />
    </div>
  );
};
