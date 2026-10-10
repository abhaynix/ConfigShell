import { AlertCircle, ArrowLeft, Copy, LoaderCircle, RefreshCw } from 'lucide-react';
import { useRef } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import type { PlanStatus } from '@/hooks/useSetupPlan';
import type { ApiRequestError, SetupPlan } from '@/lib/api';
import { OUTCOMES, PLAN_STATUS } from './outcomes';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeading } from '@/components/layout/SectionHeading';

interface PlanViewProps {
  status: PlanStatus;
  plan: SetupPlan | null;
  error: ApiRequestError | null;
  onBack: () => void;
  onRetry: () => void;
}

export function PlanView({ status, plan, error, onBack, onRetry }: PlanViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  return (
    <section aria-labelledby="plan-heading" className="page-section py-8">
      <PageContainer className="grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            as="h1"
            id="plan-heading"
            eyebrow="Setup plan"
            title="Review your setup plan"
            description={plan ? `Resolved for ${plan.environment.distro} · ${plan.environment.ecosystem}.` : 'Generating a plan from the selected applications and distribution.'}
          />
          <button type="button" onClick={onBack} className="secondary-button"><ArrowLeft size={16} aria-hidden="true" /> Back to selection</button>
        </div>

        <div ref={headingRef} aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && <PlanLoading />}
          {status === 'error' && error && <PlanError error={error} onRetry={onRetry} onBack={onBack} />}
          {status === 'ready' && plan && <PlanResults plan={plan} />}
        </div>
      </PageContainer>
    </section>
  );
}

function PlanLoading() {
  return (
    <div className="catalog-state" role="status">
      <LoaderCircle className="animate-spin text-primary" aria-hidden="true" />
      <h2>Building your setup plan</h2>
      <p>Checking the selected applications against the catalog.</p>
      <div className="plan-loading-lines" aria-hidden="true"><span /><span /><span /></div>
    </div>
  );
}

function PlanError({ error, onRetry, onBack }: { error: ApiRequestError; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="catalog-state" role="alert">
      <AlertCircle className="text-error" aria-hidden="true" />
      <h2>Could not generate a plan</h2>
      <p>{error.message}</p>
      {error.kind === 'offline' && <p>From the repository root, run <code>pnpm dev</code> to start the application server.</p>}
      <div className="flex flex-wrap gap-2">
        {error.retryable && <button type="button" onClick={onRetry} className="primary-button"><RefreshCw size={16} aria-hidden="true" /> Try again</button>}
        <button type="button" onClick={onBack} className="secondary-button">Back to selection</button>
      </div>
    </div>
  );
}

function PlanResults({ plan }: { plan: SetupPlan }) {
  const { state: copied, copy } = useClipboard();
  const statusInfo = PLAN_STATUS[plan.status] ?? PLAN_STATUS.partial;
  const { commands, manualSteps, unavailable, summary } = plan;
  const allCommands = commands.map((command) => command.command).join('\n');

  return (
    <div className="grid gap-8">
      <section className="plan-summary" aria-labelledby="plan-summary-heading">
        <h2 id="plan-summary-heading" className={cn('text-headline-md', statusInfo.tone)}>{statusInfo.title}</h2>
        <p className="text-body-sm text-text-secondary">
          {summary.selected} applications selected · {summary.installable} installable · {summary.manual} manual · {summary.unavailable} unavailable
        </p>
      </section>

      {commands.length > 0 && (
        <section aria-labelledby="commands-heading" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="commands-heading" className="text-headline-md text-text-primary">Commands to review</h2>
              <p className="text-body-sm text-text-secondary">ConfigShell does not run these for you. Review and run them yourself when ready.</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => copy(allCommands)}>
              <Copy size={16} aria-hidden="true" /> {copied === 'copied' ? 'Copied' : 'Copy all commands'}
            </button>
          </div>
          {commands.map((command, index) => (
            <article key={`${command.stepKind}:${index}`} className="plan-command">
              <div className="plan-command__header">
                <span className={OUTCOMES.installable.text}>{OUTCOMES.installable.label}</span>
                {command.summary && <span>{command.summary}</span>}
                {command.privileged && <span className={cn('plan-command__privilege', OUTCOMES.privileged.text)}>{OUTCOMES.privileged.label}</span>}
              </div>
              <div className="plan-command__body">
                <code>{command.command}</code>
                <button type="button" className="secondary-button" aria-label={`Copy command ${index + 1}`} onClick={() => copy(command.command)}>
                  <Copy size={16} aria-hidden="true" /> <span className="sr-only">Copy command</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {manualSteps.length > 0 && (
        <section className="plan-outcome-list" aria-labelledby="manual-heading">
          <h2 id="manual-heading" className={OUTCOMES.manual.text}>{OUTCOMES.manual.label}</h2>
          <p className="text-body-sm text-text-secondary">Install these yourself, following the vendor instructions.</p>
          {manualSteps.map((step) => (
            <article key={step.applicationId} className="plan-outcome-card">
              <h3>{step.applicationName}</h3>
              <p>{step.summary}</p>
              {step.url && <a href={step.url} target="_blank" rel="noreferrer" aria-label={`Vendor instructions for ${step.applicationName}`}>Vendor instructions</a>}
            </article>
          ))}
        </section>
      )}

      {unavailable.length > 0 && (
        <section className="plan-outcome-list" aria-labelledby="unavailable-heading">
          <h2 id="unavailable-heading" className={OUTCOMES.unavailable.text}>{OUTCOMES.unavailable.label}</h2>
          <p className="text-body-sm text-text-secondary">No verified installation source is available for these selections on this distribution.</p>
          {unavailable.map((entry) => (
            <article key={entry.applicationId} className="plan-outcome-card">
              <h3>{entry.applicationName}</h3>
              <p>{entry.explanation}</p>
            </article>
          ))}
        </section>
      )}

      <p className="plan-boundary">This is a read-only plan. Nothing is installed or changed on your system.</p>
    </div>
  );
}
