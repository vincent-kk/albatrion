import { describe, expect, it } from 'vitest';

import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-children-retention
describe('child list array retention across reselection', () => {
  const createHostTree = () =>
    createTestTree({
      type: 'object',
      properties: {
        host: {
          type: 'object',
          properties: { flag: { type: 'boolean' } },
          if: { properties: { flag: { const: true } }, required: ['flag'] },
          then: {
            properties: { selected: { type: 'string', default: 'entered' } },
          },
        },
        s0: { type: 'string' },
        s1: { type: 'string' },
        s2: { type: 'string' },
      },
    });

  it('P-09 keeps the parent children array when its reselected list repeats the same nodes in order', () => {
    const { root } = createHostTree();
    writeFieldNode(
      root,
      { host: { flag: false }, s0: 'a', s1: 'b', s2: 'c' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const host = root.__childrenByName__!.host;
    const rootChildren = root.children;
    const hostChildren = host.children;

    writeFieldNode(
      host.__childrenByName__!.flag,
      true,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(host.__childrenByName__!.selected?.__outputValue__).toBe('entered');
    expect(root.children).toBe(rootChildren);
    expect(host.children).not.toBe(hostChildren);
    expect(host.children).toContain(host.__childrenByName__!.selected);
  });

  it('P-09 publishes a new host children array when a child really leaves', () => {
    const { root } = createHostTree();
    writeFieldNode(
      root,
      { host: { flag: true }, s0: 'a', s1: 'b', s2: 'c' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const host = root.__childrenByName__!.host;
    const hostChildren = host.children;

    writeFieldNode(
      host.__childrenByName__!.flag,
      false,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(host.__childrenByName__!.selected).toBeUndefined();
    expect(host.children).not.toBe(hostChildren);
    expect(host.children).toHaveLength(1);
  });
});
