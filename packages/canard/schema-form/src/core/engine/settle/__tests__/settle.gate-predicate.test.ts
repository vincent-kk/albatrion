import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { FormErrorCode } from '@/schema-form/errors';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as compiler from '../../blueprint/compileBlueprintExpressions/createDynamicFunction';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import type { SettlementContext } from '../types/settlement';
import { getDirectChildSelectionPlan } from '../utils/compute/childSelection/getDirectChildSelectionPlan';
import { getGateSelectionTable } from '../utils/compute/childSelection/getGateSelectionTable';
import * as selection from '../utils/compute/childSelection/selectChildren';
import { evaluateGate } from '../utils/gates/evaluateGate';
import * as gateEvaluation from '../utils/gates/evaluateGate';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { getIfGateReadNames } from '../utils/gates/predicates/getIfGateReadNames';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createGatePredicateSchema } from './fixtures/createGatePredicateSchema';

/** Modes are test-owned; restore before another tree is analyzed. */
const modes = {
  wheel: engineModes.gateWheel,
  selection: engineModes.gateSelection,
};
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gateWheel', modes.wheel);
  engineModes.setMode('gateSelection', modes.selection);
});

// filid:contract gate-predicate
describe('unified gate predicates', () => {
  it.each(['active', 'if', 'discriminator'] as const)(
    '%s selects the same 80-branch shape in one stable-input wheel',
    (kind) => {
      engineModes.setMode('gateWheel', 'skip');
      engineModes.setMode('gateSelection', 'table');
      const validator = createTestValidator();
      const compile = validator.compileGuard;
      const calls = vi.fn();
      validator.compileGuard = (schema, pointer) => {
        const guard = compile(schema, pointer);
        return (input) => {
          calls(input);
          return guard(input);
        };
      };
      const { root, blueprint } = createTestTree(
        createGatePredicateSchema(kind),
        validator,
      );
      loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
      expect(
        getDirectChildSelectionPlan(blueprint.root, blueprint, true),
      ).not.toBeNull();
      expect(getGateSelectionTable(blueprint.root, blueprint)).not.toBeNull();
      writeFieldNode(
        root.structure!.kind,
        'tag_79',
        'input',
        WriteOption.Overwrite,
      );
      calls.mockClear();
      const selecting = vi.spyOn(selection, 'selectChildren');
      const evaluating = vi.spyOn(gateEvaluation, 'evaluateGate');
      writeFieldNode(
        root.structure!.kind,
        'tag_0',
        'input',
        WriteOption.Overwrite,
      );
      expect(root.emit).toEqual({
        kind: 'tag_0',
        payload_0_a: 'A',
        payload_0_b: 1,
        payload_0_c: true,
      });
      expect(
        selecting.mock.calls.filter(([node]) => node === root),
      ).toHaveLength(1);
      if (kind === 'if')
        expect(calls.mock.calls.length).toBeLessThanOrEqual(80);
      expect(evaluating.mock.calls.length).toBeLessThanOrEqual(80);
    },
  );

  it('reuses identical guard inputs and binds the compiler once per occurrence', () => {
    const validator = createTestValidator();
    const compile = validator.compileGuard;
    const calls = vi.fn();
    const compiling = vi
      .spyOn(validator, 'compileGuard')
      .mockImplementation((schema, pointer) => {
        const guard = compile(schema, pointer);
        return (input) => {
          calls(input);
          return guard(input);
        };
      });
    const { root } = createTestTree(
      createGatePredicateSchema('if', 2),
      validator,
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    const gate = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .find((entry) => entry.kind === 'if')!;
    const context = {
      root,
      kind: 'input',
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set(),
    } as unknown as SettlementContext<PlainNode>;
    calls.mockClear();
    compiling.mockClear();
    const first = evaluateGate(gate, context, root);
    const count = calls.mock.calls.length;
    expect(evaluateGate(gate, context, root)).toBe(first);
    expect(calls).toHaveBeenCalledTimes(count);
    expect(compiling).not.toHaveBeenCalled();
  });

  it('does not memoize thrown evaluations', () => {
    const calls = vi.fn(() => {
      throw new Error('retry');
    });
    const validator = createTestValidator();
    validator.compileGuard = () => calls;
    const { root } = createTestTree(
      createGatePredicateSchema('if', 2),
      validator,
    );
    const gate = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .find((entry) => entry.kind === 'if')!;
    const context = {
      root,
      kind: 'input',
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set(),
    } as unknown as SettlementContext<PlainNode>;
    expect(evaluateGate(gate, context, root)).toBe(false);
    expect(evaluateGate(gate, context, root)).toBe(false);
    expect(calls).toHaveBeenCalledTimes(2);
    expect(context.gateThrowVersion).toBe(2);
  });

  it('exposes the same reads/evaluate predicate contract for all kinds', () => {
    for (const kind of ['active', 'if', 'discriminator'] as const) {
      const { root } = createTestTree(createGatePredicateSchema(kind, 2));
      const gate = root.blueprintNode.declarations
        .flatMap((declaration) => declaration.gates)
        .find((entry) => entry.kind === kind)!;
      const occurrence = getGateRegistry(root.runtime).locate(root, gate);
      expect(occurrence).toHaveProperty('predicate.reads');
      expect(occurrence).toHaveProperty('predicate.evaluate');
      expect(occurrence.watchPaths).toEqual(['/kind']);
    }
  });

  it('keeps a ref hidden under not on the whole-host read', () => {
    const { root } = createTestTree({
      type: 'object',
      $defs: { flag: { required: ['flag'] } },
      if: { not: { $ref: '#/$defs/flag' } },
      then: { properties: { added: { type: 'string' } } },
    });
    const gate = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .find((entry) => entry.kind === 'if')!;
    expect(getGateRegistry(root.runtime).locate(root, gate).watchPaths).toEqual(
      [''],
    );
  });

  it('runs the discriminator tag table against per-gate shadow evaluation', () => {
    engineModes.setMode('gateSelection', 'verify');
    engineModes.setMode('gateWheel', 'shadow');
    const { root, blueprint } = createTestTree(
      createGatePredicateSchema('discriminator', 3),
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    expect(getGateSelectionTable(blueprint.root, blueprint)).not.toBeNull();
    writeFieldNode(
      root.structure!.kind,
      'tag_2',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({
      kind: 'tag_2',
      payload_2_a: 'A',
      payload_2_b: 1,
      payload_2_c: true,
    });
  });

  it('narrows nested whitelisted constraints and rejects unknown keywords at any depth', () => {
    expect(
      getIfGateReadNames({
        allOf: [
          {
            properties: {
              'a/b': {
                type: 'object',
                properties: { inner: { const: 1 } },
                required: ['inner'],
              },
            },
          },
          {
            not: {
              anyOf: [
                { required: ['flag'] },
                { dependentRequired: { flag: ['other'] } },
              ],
            },
          },
        ],
      }),
    ).toEqual(['a/b', 'flag', 'other']);
    for (const keyword of [
      '$ref',
      'patternProperties',
      'additionalProperties',
      'propertyNames',
      'unevaluatedProperties',
      'if',
      'custom',
    ])
      expect(
        getIfGateReadNames({
          not: { properties: { flag: { [keyword]: {} } } },
        }),
      ).toBeUndefined();
  });

  it('shares a complete input view between gates while its projection identities agree', () => {
    const validator = createTestValidator();
    const compile = validator.compileGuard;
    const calls = vi.fn();
    validator.compileGuard = (schema, pointer) => {
      const guard = compile(schema, pointer);
      return (input) => {
        calls(input);
        return guard(input);
      };
    };
    const { root } = createTestTree(
      createGatePredicateSchema('if', 2),
      validator,
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    const gates = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .filter((gate) => gate.kind === 'if');
    const context = {
      root,
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set(),
    } as unknown as SettlementContext<PlainNode>;
    calls.mockClear();
    evaluateGate(gates[0], context, root);
    evaluateGate(gates[1], context, root);
    expect(calls.mock.calls).toHaveLength(2);
    expect(calls.mock.calls[0][0]).toBe(calls.mock.calls[1][0]);
    expect(calls.mock.calls[0][0]).toEqual(root.emit);
  });

  it('keeps whole-host guards sensitive to an earlier entry in the same wheel', () => {
    const validator = createTestValidator();
    const compile = validator.compileGuard;
    const calls = vi.fn();
    validator.compileGuard = (schema, pointer) => {
      const guard = compile(schema, pointer);
      return (input) => {
        calls(input);
        return guard(input);
      };
    };
    const { root } = createTestTree(
      {
        type: 'object',
        $defs: { needsA: { required: ['a'] } },
        properties: { enabled: { type: 'boolean', default: false } },
        allOf: [
          {
            controls: { active: './enabled' },
            properties: { a: { type: 'string', default: 'A' } },
          },
          {
            if: { $ref: '#/$defs/needsA' },
            then: { properties: { b: { type: 'string', default: 'B' } } },
          },
        ],
      },
      validator,
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    calls.mockClear();
    const rounds: unknown[][] = [];
    const select = selection.selectChildren;
    vi.spyOn(selection, 'selectChildren').mockImplementation((...args) => {
      const start = calls.mock.calls.length;
      const changed = select(...args);
      if (args[0] === root)
        rounds.push(calls.mock.calls.slice(start).map(([input]) => input));
      return changed;
    });
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(rounds.flat()).toContainEqual({ enabled: true, a: 'A' });
    expect(root.emit).toEqual({ enabled: true, a: 'A', b: 'B' });
  });

  it('reuses a pure expression result without invoking the compiled function again', () => {
    engineModes.setMode('gateSelection', 'off');
    const compile = compiler.createDynamicFunction;
    const calls = vi.fn();
    vi.spyOn(compiler, 'createDynamicFunction').mockImplementation(
      (manager, key, source, boolean) => {
        const evaluate = boolean
          ? compile(manager, key, source, true)
          : compile(manager, key, source, false);
        if (!evaluate) return;
        return (values) => {
          calls();
          return evaluate(values);
        };
      },
    );
    const { root } = createTestTree({
      type: 'object',
      properties: { value: { type: 'number', default: 1 } },
      allOf: [
        {
          controls: { active: './value > 0' },
          properties: { kept: { type: 'string' } },
        },
      ],
    });
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    const gate = root.blueprintNode.declarations.flatMap(
      (declaration) => declaration.gates,
    )[0];
    const context = {
      root,
      kind: 'input',
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set(),
    } as unknown as SettlementContext<PlainNode>;
    calls.mockClear();
    expect(evaluateGate(gate, context, root)).toBe(true);
    const count = calls.mock.calls.length;
    expect(evaluateGate(gate, context, root)).toBe(true);
    expect(calls).toHaveBeenCalledTimes(count);
  });

  it('keeps shared template predicates and memos separate at array occurrences', () => {
    const { root } = createTestTree({
      type: 'array',
      items: createGatePredicateSchema('if', 2),
    });
    loadFieldNodeAtMount(
      root,
      [{ kind: 'tag_0' }, { kind: 'tag_1' }],
      WriteOption.Overwrite,
    );
    const first = root.structure!['0'];
    const second = root.structure!['1'];
    const gate = first.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .find((entry) => entry.kind === 'if')!;
    const registry = getGateRegistry(root.runtime);
    const context = {
      root,
      kind: 'input',
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set(),
    } as unknown as SettlementContext<PlainNode>;
    expect(evaluateGate(gate, context, first)).toBe(true);
    expect(evaluateGate(gate, context, second)).toBe(false);
    expect(registry.locate(first, gate).predicate).not.toBe(
      registry.locate(second, gate).predicate,
    );
    expect(registry.locate(first, gate).watchPaths).toEqual(['/0/kind']);
    expect(registry.locate(second, gate).watchPaths).toEqual(['/1/kind']);
  });

  it('leaves output-transforming discriminator declarations on the general selector', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          properties: {
            kind: { type: 'string', const: 'a', options: { omitEmpty: true } },
            a: { type: 'string' },
          },
        },
        {
          properties: {
            kind: { type: 'string', const: 'b' },
            b: { type: 'string' },
          },
        },
      ],
    });
    expect(getGateSelectionTable(root.blueprintNode, blueprint)).toBeNull();
  });

  it('preserves guard failure surfaces when a selected table branch exits', () => {
    engineModes.setMode('gateSelection', 'table');
    const validator = createTestValidator();
    const compile = validator.compileGuard;
    validator.compileGuard = (schema, pointer) => {
      const guard = compile(schema, pointer);
      return (input) => {
        if ((input as { kind?: string }).kind === 'tag_1')
          throw new Error('guard failed after input changed');
        return guard(input);
      };
    };
    const { root } = createTestTree(
      createGatePredicateSchema('if', 2),
      validator,
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    let failure: unknown;
    try {
      writeFieldNode(
        root.structure!.kind,
        'tag_1',
        'input',
        WriteOption.Overwrite,
      );
    } catch (cause) {
      failure = cause;
    }
    expect(failure).toMatchObject({
      code: FormErrorCode.MultipleErrors,
      details: {
        errors: [
          { code: FormErrorCode.GuardFailed },
          { code: FormErrorCode.GuardFailed },
        ],
      },
    });
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
    });
    expect(root.emit).toEqual({ kind: 'tag_1' });
  });
});
