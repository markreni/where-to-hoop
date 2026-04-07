import { useEffect, useState } from "react";

interface ProfileCircleProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
} as const;

const ProfileCircle = ({ name, imageUrl, size = 'md' }: ProfileCircleProps) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const baseClasses = `${sizeClasses[size]} rounded-full shrink-0`;

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${baseClasses} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${baseClasses} bg-blue-600 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

export { ProfileCircle };
