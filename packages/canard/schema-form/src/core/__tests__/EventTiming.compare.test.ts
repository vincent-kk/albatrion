import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

/**
 * This test compares the event timing between master and feature branches.
 *
 * Master (issue):
 * - title.setValue() → synchronous
 * - Microtask 1: title UpdateValue fires
 * - Microtask 2: openingDate/releaseDate UpdateComputedProperties fires
 * - Total: 2 microtasks needed!
 *
 * Feature (fixed with immediate flag):
 * - title.setValue() → UpdateValue fires IMMEDIATELY (synchronous)
 * - Listeners execute immediately → updateComputedProperties() called
 * - Microtask 1: openingDate/releaseDate UpdateComputedProperties fires
 * - Total: 1 microtask (UpdateComputedProperties happens in first cycle)
 */
describe('Event Timing - Master vs Feature Comparison', () => {
  it('should show improved timing: computed properties update in first microtask', async () => {
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        openingDate: {
          type: 'string',
          format: 'date',
          computed: {
            active: '../title === "wow"',
          },
        },
        releaseDate: {
          type: 'string',
          format: 'date',
          computed: {
            active: '../title === "wow"',
          },
          default: '2025-01-01',
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema: schema,
      onChange: () => {},
    });

    await delay();

    const titleNode = node.find('./title');
    const openingDateNode = node.find('./openingDate');
    const releaseDateNode = node.find('./releaseDate');

    let microtaskCount = 0;
    const eventsByMicrotask: Record<number, string[]> = {};

    const trackEvent = (nodeName: string, event: any) => {
      const key = microtaskCount;
      if (!eventsByMicrotask[key]) eventsByMicrotask[key] = [];
      eventsByMicrotask[key].push(
        `${nodeName}: ${event.type & NodeEventType.UpdateValue ? 'UpdateValue' : ''}${event.type & NodeEventType.UpdateComputedProperties ? 'UpdateComputedProperties' : ''}${event.type & NodeEventType.RequestRefresh ? 'RequestRefresh' : ''}`,
      );
    };

    titleNode?.subscribe((event) => trackEvent('title', event));
    openingDateNode?.subscribe((event) => trackEvent('openingDate', event));
    releaseDateNode?.subscribe((event) => trackEvent('releaseDate', event));

    console.log('\n=== Feature Branch: Improved Timing Test ===');
    console.log('Microtask 0 (synchronous):');

    (titleNode as StringNode)?.setValue('wow');
    console.log('  Events:', eventsByMicrotask[0] || []);

    microtaskCount = 1;
    await Promise.resolve();
    console.log('\nMicrotask 1:');
    console.log('  Events:', eventsByMicrotask[1] || []);

    microtaskCount = 2;
    await Promise.resolve();
    console.log('\nMicrotask 2:');
    console.log('  Events:', eventsByMicrotask[2] || []);

    await delay();

    console.log('\n=== Analysis ===');
    console.log(
      'Total microtasks with events:',
      Object.keys(eventsByMicrotask).length,
    );

    // In master: openingDate/releaseDate UpdateComputedProperties would be in microtask 2
    // In feature: openingDate/releaseDate UpdateComputedProperties should be in microtask 1
    const openingDateInMicrotask1 = eventsByMicrotask[1]?.some(
      (e) =>
        e.includes('openingDate') && e.includes('UpdateComputedProperties'),
    );
    const releaseDateInMicrotask1 = eventsByMicrotask[1]?.some(
      (e) =>
        e.includes('releaseDate') && e.includes('UpdateComputedProperties'),
    );

    console.log(
      'openingDate UpdateComputedProperties in microtask 1:',
      openingDateInMicrotask1,
    );
    console.log(
      'releaseDate UpdateComputedProperties in microtask 1:',
      releaseDateInMicrotask1,
    );

    // Feature branch expectation: computed properties should fire in first microtask
    expect(openingDateInMicrotask1 || releaseDateInMicrotask1).toBe(true);

    console.log(
      '\n✅ Feature branch improves timing: computed properties update in first microtask cycle!',
    );
    console.log('   Master would require 2 microtasks for the same update.');
  });
});
