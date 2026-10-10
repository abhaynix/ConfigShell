import {
  Brain,
  Code,
  Gamepad2,
  Globe,
  GraduationCap,
  Laptop,
  Server,
  Video,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { Category, CategoryId } from '@configshell/catalog';

/**
 * One icon per catalog category, in one place.
 *
 * One semantic icon and accent mapping shared by chips, presets and package cards.
 */
export const CATEGORY_ICON: Record<Category, ComponentType<{ className?: string }>> = {
  General: Laptop,
  Student: GraduationCap,
  Developer: Code,
  'Web Developer': Globe,
  DevOps: Server,
  'Data & AI': Brain,
  'Content Creator': Video,
  Gaming: Gamepad2,
};

export const CATEGORY_ID: Record<Category, CategoryId> = {
  General: 'general',
  Student: 'student',
  Developer: 'developer',
  'Web Developer': 'web-developer',
  DevOps: 'devops',
  'Data & AI': 'data-ai',
  'Content Creator': 'content-creator',
  Gaming: 'gaming',
};

export const CATEGORY_NAME: Record<CategoryId, Category> = {
  general: 'General',
  student: 'Student',
  developer: 'Developer',
  'web-developer': 'Web Developer',
  devops: 'DevOps',
  'data-ai': 'Data & AI',
  'content-creator': 'Content Creator',
  gaming: 'Gaming',
};
