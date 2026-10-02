import { describe, expect, it, vi } from 'vitest';
import * as surface from '../index';

describe('binding-only surface', () => {
  it('70C-01 build retains the default load snapshot without mounting', () => {
    const onChange = vi.fn();
    const root = surface.buildSchemaNodeTree({
      jsonSchema: { type: 'string' }, defaultValue: 'default', onChange,
    });
    expect(root.value).toBeUndefined();
    expect(root.defaultValue).toBe('default');
    expect(onChange).not.toHaveBeenCalled();
    surface.mountSchemaNode(root);
    expect(root.value).toBe('default');
    expect(onChange).toHaveBeenCalledWith('default');
  });

  it('REACT-009 WRITE-083 child input delegates through the public node view', () => {
    const root = surface.buildSchemaNodeTree({ jsonSchema: {
      type: 'object', properties: { field: { type: 'string', options: { trim: true } } },
    }, defaultValue: { field: 'initial' } });
    surface.mountSchemaNode(root);
    const child = root.find('/field');
    if (!child) throw new Error('Expected mounted child');
    surface.writeSchemaNodeInput(child, ' changed ');
    surface.finishSchemaNodeInput(child);
    expect(child.value).toBe('changed');
    expect(surface.readSchemaNodeInteractionReset(child)).toBe(0);
    surface.reloadSchemaNodeForm(root, root.defaultValue);
    expect(child.value).toBe('initial');
    expect(surface.readSchemaNodeInteractionReset(child)).toBe(1);
  });

  it('WRITE-046 binding adoption preserves old values and rejects unmarked writes', () => {
    const previous = surface.buildSchemaNodeTree({ jsonSchema: { type: 'string' }, defaultValue: 'old' });
    surface.mountSchemaNode(previous);
    const next = surface.buildSchemaNodeTree({ jsonSchema: { type: 'string' }, defaultValue: 'new' });
    surface.adoptSchemaNodeTree(previous, next);
    surface.mountSchemaNode(next);
    surface.writeSchemaNodeInput(previous, 'late');
    expect(previous.value).toBe('old');
    expect(next.value).toBe('new');
    expect(() => previous.setValue('unmarked')).toThrowError(
      expect.objectContaining({ code: expect.stringContaining('DISPOSED_NODE_WRITE') }));
  });
});
