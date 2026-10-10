import { cn } from '@/lib/utils';

interface StepperBarProps {
  selectedCount: number;
  canContinue: boolean;
  blockedReason: string;
  onContinue: () => void;
  onClear: () => void;
}

export function StepperBar({ selectedCount, canContinue, blockedReason, onContinue, onClear }: StepperBarProps) {
  return (
    <div className="selection-bar">
      <div className="selection-bar__inner">
        <div className="selection-bar__summary">
          <strong>{selectedCount}</strong> {selectedCount === 1 ? 'application' : 'applications'} selected
        </div>
        <div className="selection-bar__actions">
          {selectedCount > 0 && <button type="button" className="secondary-button" onClick={onClear}>Clear</button>}
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            title={!canContinue ? blockedReason : undefined}
            className={cn('primary-button', !canContinue && 'opacity-50 cursor-not-allowed')}
          >
            Review setup plan
          </button>
        </div>
      </div>
    </div>
  );
}
