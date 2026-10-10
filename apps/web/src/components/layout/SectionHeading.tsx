import type { ElementType } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  as?: ElementType;
  id?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, as: Heading = 'h2', id, className = '' }: SectionHeadingProps) {
  return (
    <div className={`section-heading ${Heading === 'h1' ? 'section-heading--display' : ''} ${className}`}>
      <p className="section-heading__eyebrow">{eyebrow}</p>
      <Heading id={id} className="section-heading__title">{title}</Heading>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  );
}
