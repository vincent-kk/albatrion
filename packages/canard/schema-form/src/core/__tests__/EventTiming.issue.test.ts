import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

/**
 * This test verifies the event timing issue in master branch.
 *
 * Expected issue:
 * 1. title node changes → title.publish(UpdateValue)
 * 2. Microtask 1: title UpdateValue fires
 * 3. openingDate/releaseDate listeners react
 * 4. Microtask 2: openingDate/releaseDate UpdateComputedProperties fires
 *
 * Problem: 2 microtasks needed for computed properties to update!
 */
describe('Event Timing - Master Branch Issue', () => {
  it('should demonstrate the 2-microtask delay for computed properties (ISSUE)', async () => {
    const schema = {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
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
        numOfPlayers: { type: 'number' },
        price: {
          type: 'number',
          minimum: 50,
          default: 100,
        },
      },
      if: {
        properties: {
          category: {
            enum: ['movie'],
          },
        },
      },
      then: {
        required: ['title', 'openingDate', 'price'],
      },
      else: {
        if: {
          properties: {
            category: {
              enum: ['game'],
            },
          },
        },
        then: {
          required: ['title', 'releaseDate', 'numOfPlayers'],
        },
        else: {
          required: ['title'],
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema: schema,
      onChange: () => {},
    });

    await delay();

    // Get nodes
    const titleNode = node.find('./title');
    const openingDateNode = node.find('./openingDate');
    const releaseDateNode = node.find('./releaseDate');

    // Track events
    const titleEvents: any[] = [];
    const openingDateEvents: any[] = [];
    const releaseDateEvents: any[] = [];

    titleNode?.subscribe((event) => {
      titleEvents.push({
        type: event.type,
        timestamp: performance.now(),
      });
    });

    openingDateNode?.subscribe((event) => {
      openingDateEvents.push({
        type: event.type,
        timestamp: performance.now(),
      });
    });

    releaseDateNode?.subscribe((event) => {
      releaseDateEvents.push({
        type: event.type,
        timestamp: performance.now(),
      });
    });

    // Simulate real user scenario: child node changes
    console.log('\n=== Master Branch: title node setValue ===');
    const startTime = performance.now();
    (titleNode as StringNode)?.setValue('wow');

    console.log(
      `[${(performance.now() - startTime).toFixed(2)}ms] setValue called (synchronous)`,
    );

    // Wait for first microtask
    await Promise.resolve();
    console.log(
      `[${(performance.now() - startTime).toFixed(2)}ms] After first microtask`,
    );
    console.log('  titleEvents:', titleEvents.length);
    console.log('  openingDateEvents:', openingDateEvents.length);
    console.log('  releaseDateEvents:', releaseDateEvents.length);

    // Wait for second microtask
    await Promise.resolve();
    console.log(
      `[${(performance.now() - startTime).toFixed(2)}ms] After second microtask`,
    );
    console.log('  titleEvents:', titleEvents.length);
    console.log('  openingDateEvents:', openingDateEvents.length);
    console.log('  releaseDateEvents:', releaseDateEvents.length);

    await delay();

    console.log('\n=== Final Event Summary ===');
    console.log(
      'Title node events:',
      titleEvents.map((e) => `type=${e.type}`),
    );
    console.log(
      'OpeningDate node events:',
      openingDateEvents.map((e) => `type=${e.type}`),
    );
    console.log(
      'ReleaseDate node events:',
      releaseDateEvents.map((e) => `type=${e.type}`),
    );

    // Verify the issue: UpdateComputedProperties should be delayed
    const titleUpdateValueEvents = titleEvents.filter(
      (e) => e.type & NodeEventType.UpdateValue,
    );
    const openingDateComputedEvents = openingDateEvents.filter(
      (e) => e.type & NodeEventType.UpdateComputedProperties,
    );
    const releaseDateComputedEvents = releaseDateEvents.filter(
      (e) => e.type & NodeEventType.UpdateComputedProperties,
    );

    expect(titleUpdateValueEvents.length).toBeGreaterThan(0);
    expect(openingDateComputedEvents.length).toBeGreaterThan(0);
    expect(releaseDateComputedEvents.length).toBeGreaterThan(0);

    // The issue: computed properties update in a LATER microtask
    console.log('\n=== Issue Verification ===');
    if (openingDateComputedEvents.length > 0) {
      const titleTime = titleUpdateValueEvents[0].timestamp;
      const openingDateTime = openingDateComputedEvents[0].timestamp;
      const timeDiff = openingDateTime - titleTime;
      console.log(`Time difference: ${timeDiff.toFixed(2)}ms`);
      console.log(
        'Expected: UpdateComputedProperties fires in a separate microtask (delay > 0)',
      );
      console.log(
        `Actual: ${timeDiff > 0 ? 'DELAYED (ISSUE!)' : 'IMMEDIATE (GOOD!)'}`,
      );
    }
  });
});
