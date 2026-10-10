import { useLinuxDetection } from '@/hooks/useLinuxDetection';
import { MonitorCog } from 'lucide-react';

export function LinuxDetectionCard() {
  const { state } = useLinuxDetection();
  const browserHint = state === 'linux' ? 'Linux browser detected' : state === 'not-linux' ? 'Non-Linux browser' : 'Browser OS unavailable';

  return (
    <aside aria-labelledby="fingerprint-heading" className="fingerprint-card">
      <div className="fingerprint-card__title">
        <MonitorCog size={20} aria-hidden="true" />
        <h2 id="fingerprint-heading">Active host fingerprint</h2>
      </div>
      <p className="fingerprint-card__hint">{browserHint}. A browser cannot inspect the host kernel, architecture, package manager, or init system.</p>
      <dl className="fingerprint-grid">
        {[
          ['OS hint', browserHint],
          ['Linux kernel', 'Unavailable in browser'],
          ['Architecture', 'Unavailable in browser'],
          ['Package manager', 'Choose a distribution'],
          ['Init system', 'Unavailable in browser'],
        ].map(([label, value]) => (
          <div key={label} className="fingerprint-tile">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="fingerprint-card__note">Local system detection is coming soon. Choose a distribution below to continue.</p>
    </aside>
  );
}
