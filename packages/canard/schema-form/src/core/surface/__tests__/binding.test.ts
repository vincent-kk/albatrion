import { describe, expect, it, vi } from 'vitest';

import * as surface from '../index';

describe('binding-only surface', () => {
  it('70C-01 build retains the default load snapshot without mounting', () => {
    const onChange = vi.fn();
    const root = surface.buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'default',
      onChange,
    });
    expect(root.value).toBeUndefined();
    expect(root.defaultValue).toBe('default');
    expect(onChange).not.toHaveBeenCalled();
    surface.mountFieldNode(root);
    expect(root.value).toBe('default');
    expect(onChange).toHaveBeenCalledWith('default');
  });

  it('REACT-009 WRITE-083 child input delegates through the public node view', () => {
    const root = surface.buildFieldNodeTree({
      jsonSchema: {
        type: 'object',
        properties: { field: { type: 'string', options: { trim: true } } },
      },
      defaultValue: { field: 'initial' },
    });
    surface.mountFieldNode(root);
    const child = root.find('/field');
    if (!child) throw new Error('Expected mounted child');
    surface.writeFieldNodeInput(child, ' changed ');
    surface.finishFieldNodeInput(child);
    expect(child.value).toBe('changed');
    expect(surface.readFieldNodeInteractionReset(child)).toBe(0);
    surface.reloadFieldNodeForm(root, root.defaultValue);
    expect(child.value).toBe('initial');
    expect(surface.readFieldNodeInteractionReset(child)).toBe(1);
  });

  it('WRITE-046 binding adoption preserves old values and rejects unmarked writes', () => {
    const previous = surface.buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'old',
    });
    surface.mountFieldNode(previous);
    const next = surface.buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'new',
    });
    surface.adoptFieldNodeTree(previous, next);
    surface.mountFieldNode(next);
    surface.writeFieldNodeInput(previous, 'late');
    expect(previous.value).toBe('old');
    expect(next.value).toBe('new');
    expect(() => previous.setValue('unmarked')).toThrowError(
      expect.objectContaining({
        code: expect.stringContaining('DISPOSED_NODE_WRITE'),
      }),
    );
  });
});
