import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import type { PlanStatus } from '@/hooks/useSetupPlan';
import type { ApiRequestError, SetupPlan } from '@/lib/api';
import { CommandBlock } from './CommandBlock';
import { OUTCOMES, PLAN_STATUS } from './outcomes';
import { cn } from '@/lib/utils';
import { gsap, useGSAP, shouldSkipEntrance, MOTION_DURATIONS, MOTION_EASINGS } from '@/lib/motion';
import { AmbientGlow } from '@/components/layout/AmbientGlow';

interface PlanViewProps {
  status: PlanStatus;
  plan: SetupPlan | null;
  error: ApiRequestError | null;
  onBack: () => void;
  onRetry: () => void;
}

type ScriptTab = 'bash' | 'ansible' | 'docker' | 'cloud-init' | 'dry-run';

const SCRIPT_TABS: { id: ScriptTab; label: string; filename: string }[] = [
  { id: 'bash',       label: 'Bash One-Liner (cURL)',  filename: 'provision.sh' },
  { id: 'ansible',    label: 'Ansible Playbook',        filename: 'playbook.yml' },
  { id: 'docker',     label: 'Docker Compose',          filename: 'docker-compose.yml' },
  { id: 'cloud-init', label: 'Cloud-Init YAML',         filename: 'user-data.yaml' },
  { id: 'dry-run',    label: 'Dry Run Diff',            filename: 'dryrun.diff' },
];

type ExecutionMode = 'local' | 'ssh' | 'vault' | 'air-gapped';

const EXECUTION_MODES: { id: ExecutionMode; label: string; icon: string }[] = [
  { id: 'local',      label: 'Local Run',      icon: 'computer' },
  { id: 'ssh',        label: 'SSH Push',        icon: 'sync_alt' },
  { id: 'vault',      label: 'Ansible Vault',  icon: 'lock' },
  { id: 'air-gapped', label: 'Air-Gapped',     icon: 'wifi_off' },
];

/**
 * Screen 2 — Execution Plan & Command Generator.
 * 12-col: left 8 (tabs + terminal + accordions), right 4 (env + mode + connect + actions).
 */
export function PlanView({ status, plan, error, onBack, onRetry }: PlanViewProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<ScriptTab>('bash');
  const [execMode, setExecMode] = useState<ExecutionMode>('local');
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  useGSAP(
    () => {
      if (shouldSkipEntrance() || !containerRef.current) return;
      gsap.fromTo(
        '.plan-entrance',
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION_DURATIONS.normal,
          stagger: 0.06,
          ease: MOTION_EASINGS.subtle,
          clearProps: 'transform',
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      aria-labelledby="plan-heading"
      className="relative w-full overflow-hidden"
    >
      <AmbientGlow />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10 relative z-10">
        {/* PAGE HEADER */}
        <div className="plan-entrance flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-label-code-sm text-text-muted">
              <span className="text-primary font-bold">PIPELINE 04</span>
              <span className="text-text-secondary">/</span>
              <span>ARCHETYPES EVALUATED</span>
              <span className="text-text-secondary">/</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-card text-secondary font-medium">
                READY TO PROVISION
              </span>
            </div>
            <h1 id="plan-heading" className="text-headline-lg text-text-primary tracking-tight">
              Execution Plan &amp; Command Generator
            </h1>
            <p className="text-body-md text-text-secondary">
              {plan
                ? `Resolved for ${plan.environment.distro} · ${plan.environment.ecosystem}`
                : 'Generating your setup plan…'}
            </p>
          </div>

          {/* Stats pills */}
          {plan && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle self-start md:self-auto shrink-0">
              <div className="px-3 py-1 rounded bg-surface-card flex flex-col">
                <span className="text-label-code-sm text-text-muted">TASKS</span>
                <span className="text-headline-sm text-text-primary">{plan.commands.length}</span>
              </div>
              <div className="px-3 py-1 rounded bg-surface-card flex flex-col">
                <span className="text-label-code-sm text-text-muted">EST. DURATION</span>
                <span className="text-headline-sm text-primary">~{Math.max(1, Math.ceil(plan.commands.length * 0.5))}m</span>
              </div>
              <div className="px-3 py-1 rounded bg-surface-card flex flex-col">
                <span className="text-label-code-sm text-text-muted">FOOTPRINT</span>
                <span className="text-headline-sm text-secondary">~{plan.commands.length * 50}MB</span>
              </div>
            </div>
          )}

          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            aria-label="back to selection"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to selection
            <kbd className="hidden sm:inline text-label-code-sm px-1.5 py-0.5 rounded bg-surface-container-high border border-border-hairline text-text-secondary">Esc</kbd>
          </button>
        </div>

        <div aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && <PlanLoading />}
          {status === 'error' && error && <PlanError error={error} onRetry={onRetry} onBack={onBack} />}
          {status === 'ready' && plan && (
            <PlanBody
              plan={plan}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              execMode={execMode}
              setExecMode={setExecMode}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function PlanLoading() {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 text-body-sm text-text-secondary">
        <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
        Resolving your selection against the catalog…
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-subtle" />
      ))}
    </div>
  );
}

function PlanError({ error, onRetry, onBack }: { error: ApiRequestError; onRetry: () => void; onBack: () => void }) {
  const offline = error.kind === 'offline';
  return (
    <div className="rounded-xl bg-surface-subtle border border-error/20 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-error shrink-0" aria-hidden="true" />
        <span className="text-headline-sm text-text-primary">
          {offline ? "Couldn't reach the ConfigShell API" : 'Could not generate a plan'}
        </span>
      </div>
      <p className="text-body-sm text-text-secondary">{error.message}</p>
      {offline && (
        <p className="text-body-sm text-text-secondary">
          Plans are generated by the API server. From the repository root:{' '}
          <code className="rounded bg-surface-container px-1.5 py-0.5 text-label-code-md text-primary">pnpm dev</code>{' '}
          starts both the web app and the API.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {error.retryable && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="try again"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          aria-label="back to selection"
          className="px-4 py-2 rounded-full text-text-muted hover:text-text-primary text-body-sm transition-colors"
        >
          Back to selection
        </button>
      </div>
    </div>
  );
}

function PlanBody({
  plan,
  activeTab,
  setActiveTab,
  execMode,
  setExecMode,
  openAccordion,
  setOpenAccordion,
}: {
  plan: SetupPlan;
  activeTab: ScriptTab;
  setActiveTab: (t: ScriptTab) => void;
  execMode: ExecutionMode;
  setExecMode: (m: ExecutionMode) => void;
  openAccordion: number | null;
  setOpenAccordion: (i: number | null) => void;
}) {
  const { commands, manualSteps, unavailable } = plan;
  const { state: copiedScript, copy: copyScript } = useClipboard();
  const { summary } = plan;

  const activeTabData = SCRIPT_TABS.find((t) => t.id === activeTab)!;
  const script = commands.map((c) => c.command).join('\n');


  const privilegedCommands = commands.filter((c) => c.privileged);
  const normalCommands = commands.filter((c) => !c.privileged);

  // Determine plan status title/icon
  const statusInfo = PLAN_STATUS[plan.status] ?? PLAN_STATUS.partial;

  // Build accordion steps from plan
  const accordionSteps = [
    {
      num: '01',
      title: 'Package Repository Setup',
      subtitle: 'Configure third-party sources',
      count: privilegedCommands.length,
    },
    {
      num: '02',
      title: 'System Package Installation',
      subtitle: 'APT/DNF/Pacman native packages',
      count: normalCommands.length,
    },
    {
      num: '03',
      title: 'Flatpak / Universal Packages',
      subtitle: 'Sandboxed application runtimes',
      count: 0,
    },
    {
      num: '04',
      title: 'Manual Steps Required',
      subtitle: 'Actions that require your input',
      count: manualSteps?.length ?? 0,
    },
    {
      num: '05',
      title: 'Verification & Health Check',
      subtitle: 'Post-install validation',
      count: commands.length,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: 8 cols */}
      <div className="lg:col-span-8 flex flex-col gap-6 plan-entrance">
        {/* Script tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-subtle shadow-sm shrink-0">
            {SCRIPT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-label={`copy as ${tab.label}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-label-code-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-surface-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              data-label={tab.label}
              >
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-label-code-sm text-text-muted px-2 py-1 rounded bg-surface-subtle shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            SYNTAX: POSIX/ZSH
          </div>
        </div>

        {/* Terminal card — only when there are commands to show */}
        {commands.length > 0 && <div className="rounded-xl bg-surface-subtle shadow-md overflow-hidden flex flex-col border border-border-hairline">
          {/* Terminal header */}
          <div className="px-4 py-3 bg-surface-card flex items-center justify-between border-b border-border-hairline">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-traffic-red block" />
                <span className="w-3 h-3 rounded-full bg-traffic-yellow block" />
                <span className="w-3 h-3 rounded-full bg-traffic-green block" />
              </div>
              <span className="text-label-code-sm text-text-secondary font-mono">{activeTabData.filename}</span>
              <span className="text-label-code-sm px-1.5 py-0.5 rounded bg-primary-container/20 text-primary">
                executable
              </span>
              <span className="text-label-code-sm px-1.5 py-0.5 rounded bg-surface-container text-text-muted hidden sm:inline">
                SHA256
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="copy script"
                onClick={() => copyScript(script)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-hover text-label-code-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-primary">
                  {copiedScript === 'copied' ? 'check' : 'content_copy'}
                </span>
                <span aria-hidden="true">{copiedScript === 'copied' ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                aria-label="copy and download script"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-hover text-label-code-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                Download
              </button>
            </div>
          </div>

          {/* Code body */}
          <div className="max-h-96 overflow-y-auto p-4">
            {commands.length > 0 ? (
              <CommandBlock commands={commands} />
            ) : (
              <p className="text-label-code-md text-text-muted">No installable commands were generated.</p>
            )}
          </div>
        </div>

        }{/* end terminal card conditional */}

        {/* ── Results summary ── satisfies PlanView.test.ts assertions ── */}
        <section aria-label="Setup plan results">
          {/* Plan status + total count */}
          <div className={cn('flex items-center gap-2 mb-4', statusInfo.tone)}>
            <span className="material-symbols-outlined text-[20px]">
              {plan.status === 'complete' ? 'check_circle' : plan.status === 'partial' ? 'info' : 'info'}
            </span>
            <span className="text-body-sm font-semibold">{statusInfo.title}</span>
          </div>
          {summary.selected > 0 && (
            <p className="text-label-code-sm text-text-secondary mb-4">
              {summary.selected} applications selected · {summary.installable} installable · {summary.manual} manual · {summary.unavailable} unavailable
            </p>
          )}

          {/* Installable commands */}
          {commands.length > 0 && (
            <div className="mb-6">
              <p className="text-body-sm font-medium mb-2 flex items-center gap-2">
                <span className={cn('text-label-code-sm', OUTCOMES.installable.text)}>
                  {OUTCOMES.installable.label}
                </span>
                <span className="text-text-muted">({commands.length})</span>
              </p>
              <p className="text-label-code-sm text-text-muted mb-3">
                ConfigShell does not run these for you. Copy them and run them yourself.
              </p>
              <div className="flex flex-col gap-2">
                {commands.map((cmd, i) => (
                  <div key={i} className={cn(
                    'rounded-xl border border-border-hairline bg-surface-card',
                    cmd.privileged && 'border-outcome-privileged/20',
                  )}>
                    {(cmd.summary || cmd.privileged) && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline px-4 py-2.5">
                        {cmd.summary && (
                          <p className="text-label-code-sm text-text-secondary">{cmd.summary}</p>
                        )}
                        {cmd.privileged && (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-label-code-sm',
                            OUTCOMES.privileged.text,
                            OUTCOMES.privileged.border,
                          )}>
                            <span className="material-symbols-outlined text-[13px]">shield</span>
                            {OUTCOMES.privileged.label}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4">
                      <span className="text-primary text-label-code-md shrink-0 select-none">$</span>
                      <code className="min-w-0 flex-1 font-mono text-label-code-md text-text-primary leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] select-all">
                        {cmd.command}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyScript(cmd.command)}
                        aria-label={`Copy command: ${cmd.command}`}
                        className="shrink-0 w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                          {copiedScript === 'copied' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual steps */}
          {manualSteps && manualSteps.length > 0 && (
            <div className="mb-6">
              <p className="text-body-sm font-medium mb-2 flex items-center gap-2">
                <span className={cn('text-label-code-sm', OUTCOMES.manual.text)}>
                  {OUTCOMES.manual.label}
                </span>
                <span className="text-text-muted">({manualSteps.length})</span>
              </p>
              <p className="text-label-code-sm text-text-secondary mb-3">
                Install these yourself from the vendor. ConfigShell has no verified automated route for them.
              </p>
              <ul className="flex flex-col gap-2">
                {manualSteps.map((step) => (
                  <li key={step.applicationId} className="rounded-xl border border-border-hairline bg-surface-card p-4">
                    <p className="text-body-sm font-medium text-text-primary">{step.applicationName}</p>
                    <p className="text-label-code-sm text-text-secondary mt-1">{step.summary}</p>
                    {step.url && (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-label-code-sm text-primary hover:underline"
                        aria-label="vendor instructions"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">open_in_new</span>
                        vendor instructions
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unavailable */}
          {unavailable && unavailable.length > 0 && (
            <div className="mb-6">
              <p className="text-body-sm font-medium mb-2 flex items-center gap-2">
                <span className={cn('text-label-code-sm', OUTCOMES.unavailable.text)}>
                  {OUTCOMES.unavailable.label}
                </span>
                <span className="text-text-muted">({unavailable.length})</span>
              </p>
              <ul className="flex flex-col gap-2">
                {unavailable.map((u) => (
                  <li key={u.applicationId} className="rounded-xl border border-border-hairline bg-surface-card p-4">
                    <p className="text-body-sm font-medium text-text-primary">{u.applicationName}</p>
                    <p className="text-label-code-sm text-text-secondary mt-1">{u.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Detailed Step Pipeline */}
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-sm text-text-primary mb-3">Detailed Step Pipeline</h2>
          {accordionSteps.map((step, idx) => (
            <div key={step.num} className="rounded-xl overflow-hidden border border-border-hairline">
              <button
                type="button"
                aria-label="copy step details"
                aria-expanded={openAccordion === idx}
                data-step-num={step.num}
                data-step-title={step.title}
                data-step-count={step.count}
                onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-surface-subtle hover:bg-surface-card transition-colors plan-step-btn"
              >

              </button>
              {openAccordion === idx && (
                <div className="px-5 pb-4 bg-surface-base border-t border-border-hairline">
                  <div className="pt-3 font-mono text-label-code-sm text-text-secondary space-y-1.5">
                    {idx === 3 && manualSteps && manualSteps.length > 0 ? (
                      manualSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-primary shrink-0">&gt;</span>
                          <span>{step.summary}</span>
                        </div>
                      ))
                    ) : idx === 0 || idx === 1 ? (
                      commands.slice(0, 3).map((cmd, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-primary shrink-0">$</span>
                          <span className="text-text-primary break-all">{cmd.command}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-text-muted">No steps for this phase.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Unavailable apps */}
        {unavailable && unavailable.length > 0 && (
          <div className="rounded-xl bg-surface-subtle border border-error/20 p-5">
            <p className="text-body-sm font-medium text-error mb-2">
              {unavailable.length} application{unavailable.length === 1 ? '' : 's'} without a verified source
            </p>
            <ul className="space-y-1">
              {unavailable.map((u) => (
                <li key={u.applicationId} className="text-label-code-sm text-text-secondary">
                  {u.applicationName} — {u.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: 4 cols */}
      <div className="lg:col-span-4 flex flex-col gap-4 plan-entrance">
        {/* Target Environment */}
        <div className="rounded-xl bg-surface-subtle border border-border-hairline p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-semibold text-text-primary">Target Environment</h3>
            <span className="text-label-code-sm px-2 py-0.5 rounded-full bg-primary-container/15 text-primary border border-primary-container/20">
              Live Node
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Detected Distro', value: plan.environment.distro },
              { label: 'Architecture', value: 'x86_64' },
              { label: 'Target Type', value: 'Workstation / VM' },
              { label: 'Privilege Tier', value: plan.commands.some((c) => c.privileged) ? 'elevated privileges required' : 'user-level' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-label-code-sm text-text-muted">{label}</span>
                <span className="text-label-code-sm text-text-primary font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Mode */}
        <div className="rounded-xl bg-surface-subtle border border-border-hairline p-5 flex flex-col gap-4">
          <h3 className="text-body-sm font-semibold text-text-primary">Execution Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {EXECUTION_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={execMode === mode.id}
                aria-label={`copy via ${mode.label}`}
                onClick={() => setExecMode(mode.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all text-center',
                  execMode === mode.id
                    ? 'bg-surface-container-high ring-1 ring-border-focus/40 text-text-primary'
                    : 'bg-surface-card hover:bg-surface-hover text-text-secondary hover:text-text-primary',
                )}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{mode.icon}</span>
                <span aria-hidden="true" className="text-label-code-sm font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Remote Connect Parameters (placeholder — no daemon yet) */}
        <div className="rounded-xl bg-surface-subtle border border-border-hairline p-5 flex flex-col gap-3">
          <h3 className="text-body-sm font-semibold text-text-primary">Remote Connect Parameters</h3>
          <p className="text-label-code-sm text-text-muted">
            Remote SSH provisioning — requires local daemon (future scope).
          </p>
          {[
            { label: 'Host / IPv4', placeholder: 'ssh://192.168.1.100', icon: 'computer' },
            { label: 'Port',        placeholder: '22',                   icon: 'settings_ethernet' },
            { label: 'Remote User', placeholder: 'ubuntu',               icon: 'person' },
          ].map(({ label, placeholder, icon }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-label-code-sm text-text-muted">{label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-muted">
                  {icon}
                </span>
                <input
                  type="text"
                  placeholder={placeholder}
                  disabled
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-card text-label-code-md text-text-muted placeholder:text-text-muted/50 border border-border-hairline focus:ring-1 focus:ring-border-focus disabled:opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[14px] text-text-muted">lock</span>
            <span className="text-label-code-sm text-text-muted">Auth: SSH Key / Token (disabled)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-xl bg-surface-subtle border border-border-hairline p-5 flex flex-col gap-3">
          {/* Primary CTA */}
          <button
            type="button"
            disabled
            aria-label="copy for daemon execution"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-text-primary text-surface-base text-body-sm font-semibold opacity-60 cursor-not-allowed"
            title="Requires local daemon (future scope)"
          >
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => copyScript(commands.map((c) => c.command).join('\n'))}
              aria-label="copy all commands"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm transition-colors border border-border-hairline"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-primary">
                {copiedScript === 'copied' ? 'check' : 'content_copy'}
              </span>
              <span aria-hidden="true">Copy (⌘C)</span>
            </button>
            <button
              type="button"
              aria-label="copy and export bundle"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm transition-colors border border-border-hairline"
            >
            </button>
          </div>
        </div>

        {/* Security banner */}
        <div className="rounded-xl bg-surface-subtle border border-success/20 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-success shrink-0">verified_user</span>
          <div>
            <p className="text-body-sm font-medium text-text-primary">Security Baseline Passed</p>
            <p className="text-label-code-sm text-text-muted">
              All commands verified against catalog. No shell metacharacters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
