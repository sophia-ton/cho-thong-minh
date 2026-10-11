import { useMemo } from 'react';
import { useApp } from './app';
import { markets } from '../data/db';
export function useScoped<T extends { marketId: string }>(arr: T[]): T[] {
  const { market } = useApp();
  return useMemo(() => (market === 'all' ? arr : arr.filter((x) => x.marketId === market)), [arr, market]);
}
export function useScopeName() { const { market } = useApp(); return market === 'all' ? 'Toàn thành phố' : markets.find((m) => m.id === market)!.name; }
export function useScopedMarkets() { const { market } = useApp(); return useMemo(() => (market === 'all' ? markets : markets.filter((m) => m.id === market)), [market]); }
