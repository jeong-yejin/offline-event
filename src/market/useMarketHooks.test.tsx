// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useMarket } from './perpdexday/useMarket';
import { useMarket as useT2049Market } from './token2049/useMarket';
import { MARKET_STORAGE_KEY } from '../data/perpDexMarketContent';
import { T2049_STORAGE_KEY } from '../data/t2049MarketContent';
import { readStored, writeStored } from '../infrastructure/storage';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1000000); localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

it.each([
  ['perp', useMarket, MARKET_STORAGE_KEY],
  ['token', useT2049Market, T2049_STORAGE_KEY],
] as const)('%s cleans up its clock and avoids persistence on price-only ticks', (_, useSession, key) => {
  const write = vi.spyOn(Storage.prototype, 'setItem');
  const { result, unmount } = renderHook(() => useSession());
  expect(readStored<{ point: number }>(key)?.point).toBe(result.current.state.point);
  expect(write).toHaveBeenCalledTimes(1);
  act(() => { vi.advanceTimersByTime(3000); });
  expect(result.current.state.time).toBe(1003000);
  expect(write).toHaveBeenCalledTimes(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('keeps sessions usable when storage is unavailable or malformed', () => {
  localStorage.setItem('broken', '{');
  expect(readStored('broken')).toBeNull();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('disabled'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
  expect(readStored('missing')).toBeNull();
  expect(() => writeStored('account', { point: 100 })).not.toThrow();
});
