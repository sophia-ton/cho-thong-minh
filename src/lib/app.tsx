import { createContext, useContext } from 'react';
export type Route = 'dashboard' | 'markets' | 'floorplan' | 'traders' | 'contracts' | 'fees' | 'reconcile' | 'tariff' | 'complaints' | 'notices' | 'services' | 'inspections' | 'shops' | 'archive' | 'reports' | 'mobile' | 'users' | 'audit' | 'integrations';
export interface AppState { market: string; setMarket: (m: string) => void; route: Route; go: (r: Route, opts?: { market?: string; focus?: string }) => void; focus?: string; role: string; setRole: (r: string) => void }
export const AppCtx = createContext<AppState>(null as any);
export const useApp = () => useContext(AppCtx);
