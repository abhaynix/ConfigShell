/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CatalogRegion } from '@/components/applications/CatalogRegion';
import { PageContainer } from '@/components/layout/PageContainer';
import { ConnectView } from '@/components/connect/ConnectView';
import { AppDetailSheet } from '@/components/applications/AppDetailSheet';
import { EnvironmentStep } from '@/components/environment/EnvironmentStep';
import { AppShell } from '@/components/layout/AppShell';
import { PlanView } from '@/components/plan/PlanView';
import { RoleSelector } from '@/components/roles/RoleSelector';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useSetupPlan } from '@/hooks/useSetupPlan';
import type { Application, Distro, Role } from '@configshell/catalog';
import { gsap, useGSAP, shouldSkipEntrance, MOTION_EASINGS } from '@/lib/motion';
import { StepperBar } from '@/components/layout/StepperBar';

/** Selection state lives here, one source of truth for the app views. */
export type NavRoute = 'app-catalog' | 'os-and-distro' | 'role-matrix' | 'plan-and-generate' | 'cli-detection';
type View = 'build' | 'plan' | 'connect';

/**
 * Within the 'build' view, sub-sections scroll into view rather than routing.
 * The active nav pill tracks which section is in view.
 */
export type BuildSection = 'app-catalog' | 'os-and-distro' | 'role-matrix';

const CONNECT_PATH = '/connect';

function routeToView(route: NavRoute): View {
  if (route === 'plan-and-generate') return 'plan';
  if (route === 'cli-detection') return 'connect';
  return 'build';
}

function routeFromPath(pathname: string): NavRoute {
  if (pathname === CONNECT_PATH) return 'cli-detection';
  return 'app-catalog';
}

export default function App() {
  const [view, setView] = useState<View>(() =>
    typeof window !== 'undefined' && window.location.pathname === CONNECT_PATH
      ? 'connect'
      : 'build',
  );
  const [activeRoute, setActiveRoute] = useState<NavRoute>(() =>
    typeof window !== 'undefined' && window.location.pathname === CONNECT_PATH
      ? 'cli-detection'
      : 'app-catalog',
  );
  const [distro, setDistro] = useState<Distro | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [appliedRoleId, setAppliedRoleId] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const { status, plan, error, generate, reset } = useSetupPlan();
  const planHeadingRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // Ref so navigateTo can call buildPlan even though it's defined after navigateTo
  const buildPlanRef = useRef<(() => void) | null>(null);

  // Section refs for scrolling
  const osSectionRef = useRef<HTMLDivElement>(null);
  const roleSectionRef = useRef<HTMLDivElement>(null);
  const catalogSectionRef = useRef<HTMLDivElement>(null);

  const toggleApp = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const _removeApp = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
    setAppliedRoleId(null);
  }, []);

  const applyRole = useCallback((role: Role) => {
    setSelectedIds((prev) => new Set([...prev, ...role.recommended]));
    setAppliedRoleId(role.id);
  }, []);

  useEffect(() => {
    reset();
  }, [selectedIds, distro, reset]);

  /** Navigate to a specific route, keeping address bar honest. */
  const navigateTo = useCallback((route: NavRoute) => {
    setActiveRoute(route);

    if (route === 'cli-detection') {
      window.history.pushState({}, '', CONNECT_PATH);
      setView('connect');
      return;
    }

    if (route === 'plan-and-generate') {
      // buildPlan is defined below, safe to call because this callback
      // only runs on user interaction, after all hooks have initialised.
      buildPlanRef.current?.();
      return;
    }

    window.history.pushState({}, '', '/');
    setView('build');

    setTimeout(() => {
      if (route === 'os-and-distro') {
        osSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (route === 'role-matrix') {
        roleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (route === 'app-catalog') {
        catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, []);

  const openConnect = useCallback(() => {
    window.history.pushState({}, '', CONNECT_PATH);
    setView('connect');
    setActiveRoute('cli-detection');
  }, []);

  const leaveConnect = useCallback(() => {
    window.history.pushState({}, '', '/');
    setView('build');
    setActiveRoute('app-catalog');
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const route = routeFromPath(window.location.pathname);
      setActiveRoute(route);
      setView(routeToView(route));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const canContinue = distro !== null && selectedIds.size > 0;
  const blockedReason =
    distro === null
      ? 'Choose your distribution first. Commands depend on it.'
      : 'Select at least one application.';

  const buildPlan = useCallback(() => {
    if (!distro || selectedIds.size === 0) return;
    setView('plan');
    setActiveRoute('plan-and-generate');
    void generate([...selectedIds], distro);
  }, [distro, selectedIds, generate]);

  // Keep ref in sync so navigateTo can reach buildPlan without a stale closure
  buildPlanRef.current = buildPlan;

  useEffect(() => {
    if (view === 'plan') planHeadingRef.current?.focus();
  }, [view]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (view === 'build' && canContinue) {
          e.preventDefault();
          buildPlan();
        }
        return;
      }

      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        clearAll();
        return;
      }

      if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const searchInput = document.getElementById('app-search') as HTMLInputElement | null;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
        return;
      }

      // ⌘K / Ctrl+K, focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('app-search') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      if (e.key === 'Escape' && !isInput) {
        if (view === 'plan') {
          e.preventDefault();
          setView('build');
          setActiveRoute('app-catalog');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, canContinue, buildPlan, clearAll]);

  useGSAP(
    () => {
      if (shouldSkipEntrance() || !mainRef.current) return;

      if (view === 'build') {
        const tl = gsap.timeline();
        tl.fromTo(
          '.motion-entrance-header',
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, ease: MOTION_EASINGS.subtle, clearProps: 'transform' },
          0.0,
        )
          .fromTo(
            '.motion-entrance-env',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, ease: MOTION_EASINGS.subtle, clearProps: 'transform' },
            0.05,
          )
          .fromTo(
            '.motion-entrance-roles',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, ease: MOTION_EASINGS.subtle, clearProps: 'transform' },
            0.1,
          )
          .fromTo(
            '.motion-entrance-catalog',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, ease: MOTION_EASINGS.subtle, clearProps: 'transform' },
            0.15,
          );
      } else if (view === 'plan') {
        gsap.fromTo(
          planHeadingRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.25, ease: MOTION_EASINGS.subtle, clearProps: 'transform' },
        );
      }
    },
    { dependencies: [view], scope: mainRef },
  );

  if (view === 'connect') {
    return (
      <TooltipProvider>
        <AppShell
          activeRoute={activeRoute}
          onNavigate={navigateTo}
          onOpenConnect={openConnect}
          connectActive
        >
          <ConnectView onBack={leaveConnect} />
        </AppShell>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <AppShell
        activeRoute={activeRoute}
        onNavigate={navigateTo}
        onOpenConnect={openConnect}
      >
        <main
          ref={mainRef}
          className="flex-1 bg-surface-base min-h-dvh"
        >
          {view === 'build' ? (
            <div className="relative w-full">
              <PageContainer className="page-content flex flex-col">
                <div ref={osSectionRef} className="motion-entrance-env">
                  <EnvironmentStep distro={distro} onSelect={setDistro} />
                </div>
                <div ref={roleSectionRef} className="motion-entrance-roles">
                  <RoleSelector appliedRoleId={appliedRoleId} onApply={applyRole} onClear={clearAll} />
                </div>
                <div ref={catalogSectionRef} className="motion-entrance-catalog">
                  <CatalogRegion
                    selectedIds={selectedIds}
                    onToggle={toggleApp}
                    onOpenDetails={setDetailApp}
                  />
                </div>
              </PageContainer>
            </div>
          ) : (
            <div ref={planHeadingRef} tabIndex={-1} className="outline-none">
              <PlanView
                status={status}
                plan={plan}
                error={error}
                onBack={() => {
                  setView('build');
                  setActiveRoute('app-catalog');
                }}
                onRetry={buildPlan}
              />
            </div>
          )}
        </main>

        {/* Selection summary and plan action (build view only) */}
        {view === 'build' && (
          <StepperBar
            selectedCount={selectedIds.size}
            canContinue={canContinue}
            blockedReason={blockedReason}
            onContinue={buildPlan}
            onClear={clearAll}
          />
        )}

        <AppDetailSheet
          app={detailApp}
          distro={distro}
          selected={detailApp ? selectedIds.has(detailApp.id) : false}
          onToggle={toggleApp}
          onOpenChange={(open) => !open && setDetailApp(null)}
        />
      </AppShell>
    </TooltipProvider>
  );
}
