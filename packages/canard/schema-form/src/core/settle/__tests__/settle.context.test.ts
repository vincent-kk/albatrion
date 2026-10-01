import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import type { SchemaNodeRuntime } from '../../record';
import { schemaNodeFactory, setContext, SetValueOption } from '../../SchemaNode';
import { NodeState } from '../../types/state';

/** Build one runtime tree with the already merged binding context. */
const createContextTree = (schema: BlueprintSchema,
  context: Readonly<Record<string, unknown>> = {}) =>
  schemaNodeFactory(blueprint(schema), {
    context, diagnostics: { status: 'stable' },
    loadSnapshot: undefined, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  });

// filid:contract settle-context
describe('context change settlement', () => {
  it('28C-03 setContext edge recalculates gates and derived, unsetValue, resetInteraction readers', () => {
    const root = createContextTree({ type: 'object', properties: {
      shown: { type: 'string', controls: { active: '@.show' } },
      derived: { type: 'string', controls: { derived: '@.label' } },
      cleared: { type: 'string', controls: { unsetValue: '@.clear' } },
      reset: { type: 'string', controls: { resetInteraction: '@.reset' } },
    } }, { show: false, label: 'old', clear: false, reset: false });
    root.setValue({ shown: 'visible', cleared: 'keep', reset: 'keep' });
    const reset = root.find('/reset');
    expect(reset).not.toBeNull();
    if (!reset) return;
    const runtime: SchemaNodeRuntime<unknown> = Reflect.get(root, 'runtime');
    Reflect.set(reset, 'state', { [NodeState.Dirty]: true, [NodeState.Touched]: true });

    setContext(root, { show: true, label: 'new', clear: true, reset: true });

    expect(root.find('/shown')?.active).toBe(true);
    expect(root.find('/derived')?.value).toBe('new');
    expect(root.find('/cleared')?.value).toBeUndefined();
    expect(Reflect.get(reset, 'state')[NodeState.Dirty]).toBe(false);
    expect(Reflect.get(reset, 'state')[NodeState.Touched]).toBe(false);
    expect(runtime.settlementTrace?.entry.api).toBe('setContext');
  });

  it('28C-03 injectTo no fire when only context changes', () => {
    const inject = vi.fn(() => ({ '../target': 'injected' }));
    const root = createContextTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: inject } },
      target: { type: 'string' },
      reader: { type: 'string', controls: { derived: '@.label' } },
    } }, { label: 'old' });
    root.setValue({ source: 'A' });
    const calls = inject.mock.calls.length;
    setContext(root, { label: 'new' });
    expect(inject).toHaveBeenCalledTimes(calls);
    expect(root.find('/target')?.value).toBe('injected');
    expect(root.find('/reader')?.value).toBe('new');
  });

  it('28C-08 deep-equal no settle retains trace, revision, and node.context reference', () => {
    const original = { nested: { label: 'same' } };
    const root = createContextTree({ type: 'string' }, original);
    root.setValue('value');
    const runtime: SchemaNodeRuntime<unknown> = Reflect.get(root, 'runtime');
    const trace = runtime.settlementTrace;
    const revision = Reflect.get(root, 'revisionLedger');
    setContext(root, original);
    setContext(root, { nested: { label: 'same' } });
    expect(runtime.context).toBe(original);
    expect(root.context).toBe(original);
    expect(runtime.settlementTrace).toBe(trace);
    expect(Reflect.get(root, 'revisionLedger')).toBe(revision);
  });

  it('28C-08 form default suppression consumes the context edge', () => {
    const schema: BlueprintSchema = { type: 'object', properties: {
      target: { type: 'string', controls: { derived: '@.label' } },
      unrelated: { type: 'string' },
    } };
    const suppressed = createContextTree(schema, { label: 'old' });
    const enabled = createContextTree(schema, { label: 'old' });
    suppressed.setValue({ target: 'manual' }, SetValueOption.DisableAutomaticWrites);
    enabled.setValue({ target: 'manual' }, SetValueOption.DisableAutomaticWrites);
    const suppressedRuntime: SchemaNodeRuntime<unknown> = Reflect.get(suppressed, 'runtime');
    suppressedRuntime.disableAutomaticWrites = true;
    setContext(suppressed, { label: 'new' });
    setContext(enabled, { label: 'new' });
    expect(suppressed.find('/target')?.value).toBe('manual');
    expect(enabled.find('/target')?.value).toBe('new');
    expect([...suppressedRuntime.committedRuleValues?.values() ?? []].some((value) =>
      JSON.stringify(value).includes('"new"'))).toBe(true);
    suppressed.find('/unrelated')?.setValue('later');
    expect(suppressed.find('/target')?.value).toBe('manual');
  });

  it('SETTLE-043 children derived watches the context of its live target kind', () => {
    const root = createContextTree({ type: 'object', controls: {
      children: [{ targets: ['target'], controls: { derived: './source' } }],
    }, properties: {
      source: { type: 'number' },
      target: { type: 'number', controls: { watch: ['@'] } },
    } }, { version: 1 });
    root.setValue({ source: 10 });
    root.find('/target')?.setValue(99);
    expect(root.find('/target')?.value).toBe(99);

    setContext(root, { version: 2 });
    expect(root.find('/target')?.value).toBe(10);
  });
});
