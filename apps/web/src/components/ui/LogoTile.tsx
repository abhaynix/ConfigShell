import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CategoryId } from '@configshell/catalog';

interface LogoTileProps {
  src?: string;
  name: string;
  category?: CategoryId;
  size?: 'card' | 'chip';
  lightTile?: boolean;
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
    : (words[0] ?? '?').slice(0, 2).toUpperCase();
}

export function LogoTile({ src, name, category, size = 'card', lightTile = false }: LogoTileProps) {
  const [failed, setFailed] = useState(false);
  const imageSize = size === 'card' ? 40 : 24;

  return (
    <span
      className={cn('brand-logo-tile', `brand-logo-tile--${size}`, lightTile && 'brand-logo-tile--light')}
      data-category={category}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`${name} logo`}
          width={imageSize}
          height={imageSize}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="brand-logo-fallback" role="img" aria-label={`${name} logo fallback`}>{initials(name)}</span>
      )}
    </span>
  );
}
