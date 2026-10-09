import type { Distro } from '@configshell/catalog';

export type { Distro };

export interface DistroInfo {
  name: Distro;
  tagline: string;
  description: string;
  monogram: string;
  color: string;
  versions: string[];
  feature: string;
}

export const DISTROS: DistroInfo[] = [
  {
    name: 'Ubuntu',
    tagline: 'Canonical LTS & Edge',
    description: 'Optimal for hybrid cloud infrastructure, broad hardware compatibility, and primary enterprise staging.',
    monogram: 'Ub',
    color: '#E95420',
    versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'],
    feature: 'Cloud-Init Ready',
  },
  {
    name: 'Debian',
    tagline: 'The Universal Operating System',
    description: 'Battle-tested rock-solid stability. Unmatched dependability for mission-critical databases and root routers.',
    monogram: 'Db',
    color: '#A80030',
    versions: ['12 (Bookworm)', '11 (Bullseye)'],
    feature: 'Zero Telemetry',
  },
  {
    name: 'Fedora',
    tagline: 'Cutting-edge Linux',
    description: 'Bleeding-edge features and latest packages. Prime target for modern containerized workloads and developer environments.',
    monogram: 'Fc',
    color: '#0B57D0',
    versions: ['40', '39'],
    feature: 'SELinux Enforcing',
  },
  {
    name: 'Arch Linux',
    tagline: 'Keep It Simple',
    description: 'Rolling-release control plane. Configure exactly what runs — ideal for precision-tuned workstations and homelab nodes.',
    monogram: 'Ar',
    color: '#1793D1',
    versions: ['Rolling'],
    feature: 'AUR Enabled',
  },
  {
    name: 'openSUSE',
    tagline: 'Enterprise-Grade Linux',
    description: 'Full-featured enterprise stable distribution with strong BTRFS snapshot support and YaST management.',
    monogram: 'oS',
    color: '#73BA25',
    versions: ['Tumbleweed', 'Leap 15.5'],
    feature: 'Snapper Rollback',
  },
];
