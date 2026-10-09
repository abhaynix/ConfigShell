import { DistroSelector } from './DistroSelector';
import { LinuxDetectionCard } from './LinuxDetectionCard';
import type { Distro } from '@configshell/catalog';

interface EnvironmentStepProps {
  distro: Distro | null;
  distroVersion: string | null;
  onSelect: (distro: Distro) => void;
  onSelectVersion: (v: string) => void;
}

/**
 * Screen 3 — Target Environment & Server Role Matrix top section.
 * Includes: step ribbon, H1 hero, detection card, distro grid.
 */
export function EnvironmentStep({ distro, distroVersion, onSelect, onSelectVersion }: EnvironmentStepProps) {
  return (
    <section aria-labelledby="env-heading" className="flex flex-col gap-8">
      {/* Step ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
          <span className="text-label-code-sm text-primary tracking-wide uppercase">Step 01 of 03 : Architecture Engine</span>
          <span className="text-text-muted mx-1">•</span>
          <span className="text-label-code-sm text-text-secondary">Host Target ID</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-label-code-sm text-text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-secondary">memory</span>
            Bare-metal / Virtualized
          </span>
          <span>•</span>
          <span className="text-text-secondary">Profiles Synced 4s ago</span>
        </div>
      </div>

      {/* H1 + sparkline widget */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <h1
            id="env-heading"
            className="text-headline-xl-mobile lg:text-headline-xl text-text-primary tracking-tight"
          >
            Target Environment &amp; Server Role Matrix
          </h1>
          <p className="text-body-lg text-text-secondary">
            Configure system targets for automated ChaiCode playbook orchestration. Synchronize machine specs
            or synthesize custom cloud and homelab architectures.
          </p>
        </div>

        {/* Sparkline widget */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-subtle shrink-0 border border-border-hairline">
          <div className="flex flex-col">
            <span className="text-label-code-sm text-text-muted">Cluster Readiness</span>
            <span className="text-headline-sm text-text-primary font-bold">
              99.98<span className="text-primary text-body-sm font-normal">%</span>
            </span>
          </div>
          <svg className="w-24 h-8 text-primary" fill="none" viewBox="0 0 96 32" aria-hidden="true">
            <path
              d="M0 24L16 18L32 26L48 10L64 16L80 4L96 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M0 24L16 18L32 26L48 10L64 16L80 4L96 12V32H0Z"
              fill="currentColor"
              fillOpacity="0.12"
            />
          </svg>
        </div>
      </div>

      {/* Detection card */}
      <LinuxDetectionCard />

      {/* Distro section header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-label-code-sm text-primary uppercase tracking-widest font-semibold">
              01 // TARGET OPERATING SYSTEM
            </span>
            <h2 className="text-headline-lg text-text-primary">Distribution Family</h2>
          </div>
          <p className="text-body-sm text-text-secondary max-w-md">
            ChaiCode cross-compiles scripts into native packages (.deb, .rpm, pacman, apk) and systemd daemon hooks.
          </p>
        </div>

        <DistroSelector
          selected={distro}
          selectedVersion={distroVersion}
          onSelect={onSelect}
          onSelectVersion={onSelectVersion}
        />
      </div>
    </section>
  );
}
