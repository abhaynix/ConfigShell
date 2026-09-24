/**
 * Read-only queries over the catalog.
 *
 * Lives here rather than in a consumer so the web app, the API server and any
 * future CLI all answer "which applications match this?" the same way. Pure
 * functions over the passed-in list — no I/O, no module-level state, and the
 * catalog is never mutated.
 */

import { APPLICATIONS } from './applications.ts';
import type { Application, Category } from './types.ts';

// Fast O(1) index for looking up applications by ID
const APPLICATION_MAP = new Map<string, Application>(
  APPLICATIONS.map((app) => [app.id, app]),
);

// Pre-lowercased search index to avoid re-allocating lowercased strings on every search call
interface SearchIndexEntry {
  readonly app: Application;
  readonly idLower: string;
  readonly nameLower: string;
  readonly descLower: string;
  readonly catLower: string;
}

const SEARCH_INDEX: readonly SearchIndexEntry[] = APPLICATIONS.map((app) => ({
  app,
  idLower: app.id.toLowerCase(),
  nameLower: app.name.toLowerCase(),
  descLower: app.description.toLowerCase(),
  catLower: app.category.toLowerCase(),
}));

/**
 * One application by id. `undefined` for an unknown id — callers decide whether
 * that is a 404, a validation error, or a skipped entry.
 */
export function findApplication(id: string): Application | undefined {
  return APPLICATION_MAP.get(id);
}

export interface SearchOptions {
  /** Free text matched against id, name, description and category. */
  query?: string;
  /** Exact category filter, applied in addition to `query`. */
  category?: Category;
}

/**
 * Search and filter, preserving catalog order so results are deterministic.
 *
 * Matching is a case-insensitive substring over id, name, description and
 * category. `id` is included so `vscode` finds Visual Studio Code — the web
 * app's current search does not check it, and that gap is a known one.
 * Aliases and tags are a separate, later catalog addition (PRD §14); nothing
 * here pretends they exist.
 */
export function searchApplications(options: SearchOptions = {}): readonly Application[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const { category } = options;

  if (category === undefined && query === '') {
    return APPLICATIONS;
  }

  const results: Application[] = [];
  for (let i = 0; i < SEARCH_INDEX.length; i++) {
    const entry = SEARCH_INDEX[i];
    if (category !== undefined && entry.app.category !== category) continue;
    if (
      query === '' ||
      entry.idLower.includes(query) ||
      entry.nameLower.includes(query) ||
      entry.descLower.includes(query) ||
      entry.catLower.includes(query)
    ) {
      results.push(entry.app);
    }
  }
  return results;
}
