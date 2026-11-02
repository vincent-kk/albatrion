import { describe, expect, it, vi } from 'vitest';

import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

import { find } from '../../navigation';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { getCachedPointerSegments } from '../../utils/paths/getCachedPointerSegments';
import { dispatchSetValue } from '../../write';
import { captureDetachedFieldNodeReads } from '../utils/detached/captureDetachedFieldNodeReads';
import { createDetachedCaptureTree } from './fixtures/createDetachedCaptureTree';

describe('468C-01 one-use exit defaults bypass the live pointer cache', () => {
  it.each([true, false])(
    'inserts no concrete addresses from 300 item default captures with branchless=%s',
    (branchless) => {
      const root = createDetachedCaptureTree(
        {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            rows: {
              type: 'array',
              controls: branchless
                ? undefined
                : { active: '../enabled === true' },
              items: {
                type: 'object',
                properties: {
                  first: { type: 'string' },
                  second: { type: 'string' },
                  third: { type: 'string' },
                  fourth: { type: 'string' },
                },
              },
            },
          },
        },
        {
          enabled: true,
          rows: Array.from({ length: 300 }, (_, index) => ({
            first: `first-${index}`,
            second: `second-${index}`,
            third: `third-${index}`,
            fourth: `fourth-${index}`,
          })),
        },
      );
      expect(root.runtime.blueprint.capabilities.branchless).toBe(branchless);
      const rows = find(root, '/rows');
      if (!rows) throw new Error('Mounted rows node is missing');
      getCachedPointerSegments(root.runtime, '/positive-control-before');
      const cache = getHostDerived<
        'pointerSegments',
        Map<string, readonly PointerSegment[]>
      >(root.runtime).pointerSegments;
      if (!cache)
        throw new Error('Positive control did not allocate the cache');
      const insert = vi.spyOn(cache, 'set');
      try {
        getCachedPointerSegments(root.runtime, '/positive-control-after');
        expect(insert).toHaveBeenCalledTimes(1);
        insert.mockClear();
        const departed = rows.children?.[0];
        if (!departed) throw new Error('Mounted array has no item');
        if (branchless) {
          dispatchSetValue(rows, []);
          expect(rows.children).toHaveLength(0);
          expect(departed.detached).toBe(true);
        } else {
          // Presence registration has its own live-path reads; isolate exit capture here.
          for (const item of rows.children ?? [])
            for (const node of [item, ...(item.children ?? [])])
              captureDetachedFieldNodeReads(node, {
                schema: node.schema.schema,
                emit: root.emit,
                context: root.runtime.context,
              });
        }
        expect(insert.mock.calls.length).toBe(0);
      } finally {
        insert.mockRestore();
      }
    },
  );
});
