import { useEffect, useRef } from 'react';
import { APPLICATIONS, ROLES } from '@configshell/catalog';
import type { Distro } from '@configshell/catalog';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface StepperBarProps {
  distro: Distro | null;
  distroVersion: string | null;
  appliedRoleId: string | null;
  selectedCount: number;
  selectedIds: Set<string>;
  canContinue: boolean;
  blockedReason: string;
  onContinue: () => void;
  onClear: () => void;
}

/**
 * Sticky bottom stepper bar.
 * Shows selected distro + role chips, selected app count,
 * a "Review Plan & Generate" primary CTA and ⌘↵ hint.
 * Matches Screen 1 & 3 bottom bar in the Stitch design.
 */
export function StepperBar({
  distro,
  distroVersion,
  appliedRoleId,
  selectedCount,
  selectedIds,
  canContinue,
  blockedReason,
  onContinue,
  onClear,
}: StepperBarProps) {
  const selectedApps = APPLICATIONS.filter((a) => selectedIds.has(a.id));
  const { state: clipState, copy } = useClipboard();
  const role = ROLES.find((r) => r.id === appliedRoleId);

  const ids = selectedApps.map((a) => a.id).join(' ');
  const cliCmd = `npx configshell add ${ids}`;

  const packageCount = role ? role.recommended.length : 0;
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = trayRef.current;
    if (!element) return;
    const updateHeight = () => document.documentElement.style.setProperty('--stepper-height', `${element.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    updateHeight();
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty('--stepper-height', '0px');
    };
  }, []);

  return (
    <div className="sticky z-20 px-6 pointer-events-none" style={{ top: 'calc(100vh - var(--stepper-height, 0px) - 24px)' }}>
      <div
        ref={trayRef}
        className="max-w-4xl mx-auto rounded-2xl bg-surface-card/95 backdrop-blur-md border border-border-hairline shadow-2xl pointer-events-auto"
        style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.08)' }}
      >
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
          {/* Selection chips */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Count */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-label-code-sm text-text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-[13px] text-primary">apps</span>
              <span className="text-text-primary font-semibold">{selectedCount}</span>
              <span>selected</span>
            </span>

            {/* Ansible bundle chip */}
            {selectedCount > 0 && (
              <span className="hidden sm:contents">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-label-code-sm text-secondary border border-border-hairline">
                <span className="material-symbols-outlined text-[12px]">deployed_code</span>
                Ansible Bundle
              </span>

            {/* Distro chip */}
            {distro && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-label-code-sm text-text-primary border border-border-hairline">
                <span className="material-symbols-outlined text-[12px] text-primary">terminal</span>
                Target: {distro}{distroVersion ? ` ${distroVersion}` : ''}
              </span>
            )}

            {/* Role chip */}
            {role && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-label-code-sm text-text-primary border border-border-hairline">
                <span className="material-symbols-outlined text-[12px] text-secondary">psychology</span>
                Role: {role.name} ({packageCount} packages pre-configured)
              </span>
            )}

            {/* Selected app names */}
            {selectedCount > 0 && selectedCount <= 4 && (
              <span className="text-label-code-sm text-text-muted truncate max-w-xs hidden sm:block">
                {selectedApps.map((a) => a.name).join(', ')}
              </span>
            )}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-label-code-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Clear
              </button>
            )}

            {/* Copy CLI command */}
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => copy(cliCmd)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-border-hairline text-label-code-sm text-text-secondary hover:border-border-hover transition-colors"
                aria-label="Copy CLI install command"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">
                  {clipState === 'copied' ? 'check' : 'content_copy'}
                </span>
                {clipState === 'copied' ? 'Copied!' : 'Copy Recipe'}
              </button>
            )}

            {/* Primary CTA */}
            <button
              type="button"
              onClick={canContinue ? onContinue : undefined}
              disabled={!canContinue}
              aria-disabled={!canContinue}
              title={!canContinue ? blockedReason : undefined}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 px-5 max-sm:px-3 py-2 rounded-full text-body-sm font-semibold transition-all duration-200',
                canContinue
                  ? 'bg-primary-container text-on-primary hover:bg-primary-container/90 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                  : 'bg-surface-container text-text-muted cursor-not-allowed opacity-50',
              )}
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span className="hidden sm:inline">Review Plan &amp; Generate</span>
              <span className="sm:hidden">Review Plan</span>
              <kbd className="hidden sm:inline text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded">⌘↵</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
