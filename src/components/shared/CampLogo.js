'use client';

import Image from 'next/image';
import { useState } from 'react';

import { useCamp } from '@/context/CampContext';
import { campLogoSrc, DEFAULT_BRAND_LOGO } from '@/lib/brand';

export default function CampLogo({
  className = '',
  height = 64,
  width = 200,
  priority = false,
}) {
  const [showImage, setShowImage] = useState(true);
  const { camp } = useCamp() || {};

  const campName = camp?.name || 'تَكافل - مخيم طيبة التربوي';
  const campLogo = campLogoSrc(camp);

  if (!showImage) {
    return (
      <span
        className={`inline-block text-xl font-bold tracking-tight text-primary ${className}`}
        aria-hidden
      >
        {camp?.name ? camp.name.split(' ')[0] : 'تَكافل'}
      </span>
    );
  }

  return (
    <Image
      src={campLogo}
      alt={campName}
      width={width}
      height={height}
      priority={priority}
      unoptimized={campLogo !== DEFAULT_BRAND_LOGO}
      onError={() => setShowImage(false)}
      className={`h-auto w-auto object-contain object-right drop-shadow-[0_1px_2px_rgba(15,23,42,0.08)] [image-rendering:auto] ${className}`}
    />
  );
}
