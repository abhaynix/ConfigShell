import { DistroSelector } from './DistroSelector';
import { LinuxDetectionCard } from './LinuxDetectionCard';
import { SectionHeading } from '@/components/layout/SectionHeading';
import type { Distro } from '@configshell/catalog';

interface EnvironmentStepProps {
  distro: Distro | null;
  onSelect: (distro: Distro) => void;
}

export function EnvironmentStep({ distro, onSelect }: EnvironmentStepProps) {
  return (
    <section aria-labelledby="env-heading" className="page-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <SectionHeading
          className="lg:col-span-7"
          as="h1"
          id="env-heading"
          eyebrow="Linux application catalog · Step 1"
          title="Choose a target environment"
          description="Select a supported Linux distribution. The browser can report a broad OS hint, but it cannot read your kernel or package manager."
        />
        <div className="lg:col-span-5"><LinuxDetectionCard /></div>
        <div id="distribution-family" className="lg:col-span-12 scroll-mt-24">
          <SectionHeading
            eyebrow="Supported targets"
            title="Linux distributions"
            className="mb-6"
          />
          <DistroSelector
            selected={distro}
            onSelect={onSelect}
          />
        </div>
      </div>
    </section>
  );
}
