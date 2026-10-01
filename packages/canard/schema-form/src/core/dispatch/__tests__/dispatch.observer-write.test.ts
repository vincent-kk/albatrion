import { describe, expect, it, vi } from 'vitest';

import { SchemaFormError, WRITE_IN_OBSERVER } from '../../../errors';
import { dispatchSetValue, subscribeSchemaNode } from '../index';
import { reportOwnerlessError } from '../utils/report/reportOwnerlessError';
import { createDispatchTree } from './fixtures/createDispatchTree';

// filid:contract dispatch-report
describe('observer write boundary', () => {
  it('ERROR-029 WRITE-099 rejects a same-form write immediately without recursion', () => {
    const seen: unknown[] = [];
    const failure = new Error('listener');
    const { root } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: () => {
        try { dispatchSetValue(root, 'blocked'); } catch (error) { seen.push(error); }
      } });
    subscribeSchemaNode(root, () => { throw failure; });
    expect(() => dispatchSetValue(root, 'value')).toThrow(failure);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBeInstanceOf(SchemaFormError);
    if (!(seen[0] instanceof SchemaFormError)) throw new Error('Expected write failure');
    expect(seen[0].code).toBe(`SCHEMA_FORM_ERROR.${WRITE_IN_OBSERVER}`);
    expect(root.emit).toBe('value');
  });

  it('ERROR-029 allows writes on another form while reporting', () => {
    const other = createDispatchTree({ type: 'string' });
    const { root } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true,
        report: () => dispatchSetValue(other.root, 'allowed') });
    subscribeSchemaNode(root, () => { throw new Error('listener'); });
    expect(() => dispatchSetValue(root, 'source')).toThrow();
    expect(other.root.emit).toBe('allowed');
  });

  it('ERROR-008 ownerless fallback reports once without Node emission', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('ownerless');
    try { reportOwnerlessError(failure); expect(spy).toHaveBeenCalledWith(failure); }
    finally { spy.mockRestore(); }
  });

  it('ERROR-008 prefers window.reportError over console', () => {
    const reportError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('window', { reportError });
    const failure = new Error('browser');
    try {
      reportOwnerlessError(failure);
      expect(reportError).toHaveBeenCalledExactlyOnceWith(failure);
      expect(consoleError).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); consoleError.mockRestore(); }
  });

  it('ERROR-008 uses ErrorEvent and respects cancellation', () => {
    /** Minimal browser event constructor for the ownerless branch. */
    class ErrorEventStub {
      /** Error carried to the browser observer. */
      readonly error: unknown;
      constructor(_type: string, options: { error: unknown }) {
        this.error = options.error;
      }
    }
    const dispatchEvent = vi.fn(() => false);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('ErrorEvent', ErrorEventStub);
    const failure = new Error('event');
    try {
      reportOwnerlessError(failure);
      expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ error: failure }));
      expect(consoleError).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); consoleError.mockRestore(); }
  });
});
