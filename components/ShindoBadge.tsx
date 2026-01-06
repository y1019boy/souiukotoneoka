import React from 'react';
import { getShindoColor, getShindoLabel } from '../constants';

interface ShindoBadgeProps {
  scale: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ShindoBadge: React.FC<ShindoBadgeProps> = ({ scale, size = 'md' }) => {
  const colorClass = getShindoColor(scale);
  const label = getShindoLabel(scale);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-lg flex flex-col items-center justify-center font-bold text-white shadow-md transition-transform transform hover:scale-105`}
    >
      <span className="text-[0.6em] opacity-80 leading-none">震度</span>
      <span className="leading-none">{label}</span>
    </div>
  );
};