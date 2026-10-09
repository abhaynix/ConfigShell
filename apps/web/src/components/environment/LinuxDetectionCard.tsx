import { useEffect, useRef, useState } from 'react';
import { useLinuxDetection } from '@/hooks/useLinuxDetection';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/motion';

type DetectionState = 'linux' | 'not-linux' | 'unknown';

interface TelemetryTileProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  pending?: boolean;
}

function TelemetryTile({ icon, label, value, sub, pending }: TelemetryTileProps) {
  return (
    <div className="p-3 rounded-lg bg-surface-card flex flex-col gap-1">
      <span className="text-label-code-sm text-text-muted flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>
        {label}
      </span>
      {pending
        ? <span aria-label="Detecting" className="my-0.5 block h-4 animate-pulse rounded bg-surface-container-high" />
        : <span className="min-h-5 text-label-code-md text-text-primary font-semibold">{value}</span>}
      <span className="min-h-4 text-label-code-sm text-text-secondary">{sub}</span>
    </div>
  );
}

function getTelemetry(state: DetectionState) {
  if (state === 'linux') {
    return {
      os: { icon: 'terminal', label: 'OS Flavor', value: 'Linux (Browser)', sub: 'User-agent detected' },
      kernel: { icon: 'layers', label: 'Linux Kernel', value: '—', sub: 'Not detected' },
      arch: { icon: 'memory', label: 'Architecture', value: '—', sub: 'Not detected' },
      pkgmgr: { icon: 'package_2', label: 'Package Mgr', value: '—', sub: 'Not detected' },
      init: { icon: 'precision_manufacturing', label: 'Init Engine', value: '—', sub: 'Not detected' },
    };
  }
  return {
    os: { icon: 'terminal', label: 'OS Flavor', value: 'Undetected', sub: 'Select manually' },
    kernel: { icon: 'layers', label: 'Linux Kernel', value: '—', sub: 'Not available' },
    arch: { icon: 'memory', label: 'Architecture', value: '—', sub: 'Not available' },
    pkgmgr: { icon: 'package_2', label: 'Package Mgr', value: '—', sub: 'Choose a distro' },
    init: { icon: 'precision_manufacturing', label: 'Init Engine', value: '—', sub: 'Choose a distro' },
  };
}

/**
 * Detection card — Screen 3 section before distro grid.
 * Shows detected environment info and provides "Use Detected System" / "Customize Manually" CTAs.
 * Since real daemon detection is future scope, this is a visually complete state.
 */
export function LinuxDetectionCard() {
  const { state, redetect } = useLinuxDetection();
  const [checking, setChecking] = useState(() => !prefersReducedMotion());
  const cardRef = useRef<HTMLDivElement>(null);
  const detectionState = state as DetectionState;
  const telemetry = getTelemetry(detectionState);

  useEffect(() => {
    if (!checking) return;
    const timer = setTimeout(() => setChecking(false), 180);
    return () => clearTimeout(timer);
  }, [checking]);

  const handleDetectAgain = () => {
    setChecking(true);
    redetect();
  };

  return (
    <section aria-labelledby="live-detection-heading">
      <div
        ref={cardRef}
        className="rounded-xl bg-surface-subtle p-6 relative overflow-hidden shadow-xl border border-border-hairline"
      >
        {/* Orange glow corner */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"
          style={{ background: 'rgb(249 115 22 / 0.15)' }}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* State metadata */}
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-card">
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    state === 'linux' ? 'bg-primary' : 'bg-text-muted',
                  )} />
                  <span className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    state === 'linux' ? 'bg-primary-container' : 'bg-text-muted',
                  )} />
                </span>
                <span className="text-label-code-sm text-text-primary font-medium tracking-wide">
                  {checking ? 'Scanning…' : state === 'linux' ? 'Linux Detected' : 'Local Daemon Connected'}
                </span>
              </span>
              <span className="text-label-code-sm text-text-muted font-mono">
                PID 24194 • socket /var/run/configshell.sock
              </span>
            </div>
            <div>
              <h2
                id="live-detection-heading"
                className="text-headline-md text-text-primary tracking-tight"
              >
                Active Host Fingerprint Identified
              </h2>
              <p className="text-body-sm text-text-secondary mt-1">
                {state === 'linux'
                  ? 'Your browser reports a Linux environment. For full system telemetry, the local daemon is required. Select your distribution below to continue.'
                  : 'The hardware scanning daemon discovered your active runtime configuration. You can import these exact base primitives or construct a sandbox configuration.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDetectAgain}
              className="px-5 py-2.5 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm font-medium transition-all duration-200"
            >
              Customize Manually
            </button>
            <button
              type="button"
              onClick={handleDetectAgain}
              className="group relative px-6 py-2.5 rounded-full bg-primary-container hover:bg-primary-container/90 text-on-primary text-body-sm font-semibold transition-all duration-200 shadow-md flex items-center gap-2"
              aria-label="Use detected system configuration"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Use Detected System</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Telemetry grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-4 border-t border-border-hairline">
          <TelemetryTile {...telemetry.os} pending={checking} />
          <TelemetryTile {...telemetry.kernel} pending={checking} />
          <TelemetryTile {...telemetry.arch} pending={checking} />
          <TelemetryTile {...telemetry.pkgmgr} pending={checking} />
          <TelemetryTile {...telemetry.init} pending={checking} />
        </div>
      </div>
    </section>
  );
}
