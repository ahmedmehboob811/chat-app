
import React from 'react';

interface UserAvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, alt, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'h-8 w-8' : 'h-12 w-12';

  return <img src={src} alt={alt} className={`${sizeClasses} rounded-full object-cover`} />;
};

export default UserAvatar;
