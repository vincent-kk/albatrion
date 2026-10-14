import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount, writeFieldNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('latent descendant exit policies', () => {
  it('SETTLE-017 small exit parses no unrelated committed policies', () => {
    const parseCount = (size: number): number => {
      const properties: Record<string, BlueprintSchema> = {
        flag: { type: 'boolean' },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
        },
      };
      for (let index = 0; index < size; index++)
        properties[`other${index}`] = {
          type: 'string',
          controls: {
            unsetOnInactive: 'false',
          },
        };
      const { root } = createTestTree({ type: 'object', properties });
      loadFieldNodeAtMount(
        root,
        { flag: true, secret: 'held' },
        WriteOption.Overwrite,
      );
      const parse = vi.spyOn(JSON, 'parse');
      try {
        writeFieldNode(
          root.structure!.flag,
          false,
          'input',
          WriteOption.Overwrite,
        );
        return parse.mock.calls.length;
      } finally {
        parse.mockRestore();
      }
    };
    const small = parseCount(64);
    const large = parseCount(640);
    expect(large).toBe(small);
  });

  it('WRITE-038 simultaneous exit reads the previous committed policy value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        clear: { type: 'boolean' },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: '../clear',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, clear: false, secret: 'held' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { flag: false, clear: true },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.secret).toBeUndefined();
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string'])),
    ).toBe('held');
  });

  it('WRITE-038 updates a node expression while that node remains in shape', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        clear: { type: 'boolean' },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: '../clear',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, clear: false, secret: 'held' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.clear, true, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])),
    ).toBe(false);
  });

  it('WRITE-034 keeps a latent kind beside a live different kind', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        outer: {
          type: 'object',
          controls: {
            active: '../show',
            discriminator: 'kind',
            unsetOnInactive: true,
          },
          properties: { kind: { type: 'string' } },
          oneOf: [
            {
              properties: {
                kind: { type: 'string', const: 'a' },
                value: { type: 'string', controls: { unsetOnInactive: false } },
              },
            },
            {
              properties: {
                kind: { type: 'string', const: 'b' },
                value: { type: 'number', controls: { unsetOnInactive: true } },
              },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { show: true, outer: { kind: 'a', value: 'held' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.outer.structure!.kind,
      'b',
      'input',
      WriteOption.Overwrite,
    );
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/outer/value', 'string'])),
    ).toBe('held');
    writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/outer/value', 'string'])),
    ).toBe('held');
  });

  it('WRITE-034 uses the last live expression after a suppressed exit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        branch: {
          type: 'object',
          controls: {
            active: '../show',
            unsetOnInactive: true,
          },
          properties: {
            gate: { type: 'boolean' },
            secret: {
              type: 'string',
              controls: {
                active: '../gate',
                unsetOnInactive: '../gate',
              },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      {
        show: true,
        branch: {
          gate: true,
          secret: 'held',
        },
      },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.branch.structure!.gate,
      false,
      'input',
      WriteOption.DisableAutomaticWrites,
    );
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/branch/secret', 'string'])),
    ).toBe('held');
    expect(
      [...(root.runtime.committedRuleValues?.keys() ?? [])].some((key) =>
        key.startsWith('["/branch/secret",'),
      ),
    ).toBe(false);
    writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/branch/secret', 'string'])),
    ).toBe(false);
  });
});
