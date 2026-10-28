import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';
import * as segmentGrammar from '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments';

import { getHostDerived } from '../../cache/derivedRecords';
import { engineModes } from '../../cache/engineModes';
import { getCachedPointerSegments } from '../getCachedPointerSegments';

afterEach(() => vi.restoreAllMocks());

describe('runtime pointer syntax ownership', () => {
  it('reuses one decoded array on a hit and keeps reserved literals distinct', () => {
    const runtime = {};
    const decode = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    const first = getCachedPointerSegments(runtime, '/%2A');
    expect(first).toEqual(['*']);
    expect(decode).toHaveBeenCalledTimes(1);
    decode.mockClear();
    expect(getCachedPointerSegments(runtime, '/%2A')).toBe(first);
    expect(decode).not.toHaveBeenCalled();
    expect(getCachedPointerSegments(runtime, '/*')).not.toEqual(first);
  });

  it('caps FIFO ownership at 256 addresses and refills an evicted address', () => {
    const runtime = {};
    const first = getCachedPointerSegments(runtime, '/name0');
    for (let index = 1; index <= 256; index++)
      getCachedPointerSegments(runtime, `/name${index}`);
    const cache = getHostDerived<
      'pointerSegments',
      Map<string, readonly PointerSegment[]>
    >(runtime).pointerSegments!;
    expect(cache.size).toBe(256);
    expect(cache.has('/name0')).toBe(false);
    const decode = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    const retained = getCachedPointerSegments(runtime, '/name256');
    expect(getCachedPointerSegments(runtime, '/name256')).toBe(retained);
    expect(decode).not.toHaveBeenCalled();
    expect(getCachedPointerSegments(runtime, '/name0')).not.toBe(first);
    expect(decode).toHaveBeenCalledTimes(1);
    expect(cache.size).toBe(256);
    expect(cache.has('/name1')).toBe(false);
  });

  it('separates runtime identities rather than sharing a live tree cache', () => {
    const firstRuntime = {};
    const rebuiltRuntime = {};
    const first = getCachedPointerSegments(firstRuntime, '/value');
    const rebuilt = getCachedPointerSegments(rebuiltRuntime, '/value');
    expect(rebuilt).toEqual(first);
    expect(rebuilt).not.toBe(first);
    expect(getCachedPointerSegments(firstRuntime, '/value')).toBe(first);
  });

  it('follows the existing derived-record generation on an actual mode change', () => {
    const runtime = {};
    const first = getCachedPointerSegments(runtime, '/value');
    const previous = engineModes.gateWheel;
    try {
      engineModes.setMode('gateWheel', previous === 'skip' ? 'record' : 'skip');
      expect(getCachedPointerSegments(runtime, '/value')).not.toBe(first);
    } finally {
      engineModes.setMode('gateWheel', previous);
    }
  });
});
