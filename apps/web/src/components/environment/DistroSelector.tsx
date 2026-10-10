import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DISTROS, ecosystemForDistro, type Distro } from '@configshell/catalog';
import { LogoTile } from '@/components/ui/LogoTile';

const DISTRO_LOGOS: Record<Distro, string> = {
  Ubuntu: '/logos/distros/ubuntu.svg',
  Fedora: '/logos/distros/fedora.svg',
  'Arch Linux': '/logos/distros/archlinux.svg',
  openSUSE: '/logos/distros/opensuse.svg',
};

interface DistroSelectorProps {
  selected: Distro | null;
  onSelect: (distro: Distro) => void;
}

export function DistroSelector({ selected, onSelect }: DistroSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Select a Linux distribution" className="distro-grid">
      {DISTROS.map((distro) => {
        const active = selected === distro;
        const ecosystem = ecosystemForDistro(distro);
        return (
          <article key={distro} className={cn('distro-card', active && 'is-selected')}>
            <label className="distro-card__choice">
              <input
                type="radio"
                name="target-distribution"
                value={distro}
                checked={active}
                onChange={() => onSelect(distro)}
              />
              <LogoTile src={DISTRO_LOGOS[distro]} name={distro} />
              <span className="distro-card__name"><strong>{distro}</strong></span>
              {active && <Check className="distro-card__check" size={20} aria-hidden="true" />}
            </label>
            <p className="distro-card__fact">Native package manager: <strong>{ecosystem}</strong></p>
          </article>
        );
      })}
    </div>
  );
}
