import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isArrayNode,
} from '../../index';

afterEach(cleanup);
/** Two live hosts share source syntax while retaining independent values. */
const pairSchema = (
  derived: string,
  ref: boolean,
  gated = false,
): JSONSchema => {
  const P: JSONSchema = {
    type: 'object',
    properties: {
      a: { type: 'string', default: 'v' },
      b: { type: 'string', controls: { derived } },
    },
  };
  return {
    type: 'object',
    $defs: { P },
    properties: {
      source: { type: 'string', default: 's' },
      enabled: { type: 'boolean', default: true },
      x: ref ? { $ref: '#/$defs/P' } : P,
      g: {
        type: 'object',
        properties: {
          source: { type: 'string', default: 'g' },
          y: {
            ...(ref ? { $ref: '#/$defs/P' } : P),
            ...(gated
              ? { controls: { active: '../../enabled === true' } }
              : {}),
          },
        },
      },
    },
  };
};
describe('round-2 schema-form 2: dependency occurrence lifecycle', () => {
  it.each(['(/source) + "!"', '(../../source) + "!"'])(
    'matches inline external dependency %s',
    async (derived) => {
      const run = async (ref: boolean) => {
        const handle = createRef<FormHandle>();
        const view = render(
          <Form
            ref={handle}
            jsonSchema={pairSchema(derived, ref)}
            validationMode={ValidationMode.None}
          />,
        );
        await act(() =>
          handle
            .current!.findNode(
              derived.includes('/source)') && !derived.includes('../')
                ? '/source'
                : '/g/source',
            )!
            .setValue('changed'),
        );
        const result = handle.current!.getValue();
        view.unmount();
        return result;
      };
      expect(await run(true)).toEqual(await run(false));
    },
  );
  it('matches inline context rebinding', async () => {
    const run = async (ref: boolean) => {
      const jsonSchema = pairSchema('@.suffix', ref);
      const handle = createRef<FormHandle>();
      const tree = (suffix: string) => (
        <Form
          ref={handle}
          jsonSchema={jsonSchema}
          context={{ suffix }}
          validationMode={ValidationMode.None}
        />
      );
      const view = render(tree('before'));
      view.rerender(tree('after'));
      await act(async () => {});
      const result = handle.current!.getValue();
      view.unmount();
      return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
  it('matches inline exit and inactive-slot re-entry', async () => {
    const run = async (ref: boolean) => {
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          jsonSchema={pairSchema('(../a) + "!"', ref, true)}
          validationMode={ValidationMode.None}
        />,
      );
      await act(() => handle.current!.findNode('/enabled')!.setValue(false));
      await act(() => handle.current!.findNode('/enabled')!.setValue(true));
      await act(() => handle.current!.findNode('/g/y/a')!.setValue('changed'));
      const result = handle.current!.getValue();
      view.unmount();
      return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
  it('matches inline reset of a reused root', async () => {
    const run = async (ref: boolean) => {
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          jsonSchema={pairSchema('(../a) + "!"', ref)}
          validationMode={ValidationMode.None}
        />,
      );
      await act(() => handle.current!.reset());
      await act(() => handle.current!.findNode('/g/y/a')!.setValue('changed'));
      const result = handle.current!.getValue();
      view.unmount();
      return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
  it('rebinds recursive array occurrences after insert, move and remove', async () => {
    const run = async (ref: boolean) => {
      const level = (depth: number): JSONSchema => ({
        type: 'object',
        properties: {
          name: { type: 'string' },
          label: { type: 'string', controls: { derived: '(../name) + "#"' } },
          kids: {
            type: 'array',
            items: ref ? { $ref: '#/$defs/n' } : depth ? level(depth - 1) : false,
          },
        },
      });
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          validationMode={ValidationMode.None}
          jsonSchema={
            ref ? { $defs: { n: level(0) }, $ref: '#/$defs/n' } : level(3)
          }
          defaultValue={{ name: 'r', kids: [{ name: 'c', kids: [{ name: 'g' }, { name: 'h' }] }] }} />,
      );
      const kids = handle.current!.findNode('/kids/0/kids')!;
      if (!isArrayNode(kids)) throw new Error('Expected array');
      await act(() => kids.insert(0, { name: 'inserted' }));
      await act(() => kids.insert(0, kids.remove(2)));
      await act(() => kids.remove(1));
      await act(() => handle.current!.findNode('/kids/0/kids/0/name')!.setValue('changed'));
      const result = handle.current!.getValue();
      view.unmount();
      return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
  it('rebinds two oneOf candidates at the same occurrence path', async () => {
    const run = async (ref: boolean) => {
      const P: JSONSchema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'v' },
          b: { type: 'string', controls: { derived: '(../a) + "!"' } },
        },
      };
      const Q: JSONSchema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'q' },
          b: { type: 'string', controls: { derived: '(../a) + "?"' } },
        },
      };
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          jsonSchema={{
            type: 'object',
            $defs: { P, Q },
            properties: {
              kind: { type: 'boolean', default: true },
              first: ref ? { $ref: '#/$defs/P' } : P,
              other: ref ? { $ref: '#/$defs/Q' } : Q,
            },
            oneOf: [
              {
                controls: { active: './kind === true' },
                properties: { current: ref ? { $ref: '#/$defs/P' } : P },
              },
              {
                controls: { active: './kind === false' },
                properties: { current: ref ? { $ref: '#/$defs/Q' } : Q },
              },
            ],
          }}
          validationMode={ValidationMode.None}
        />,
      );
      await act(() => handle.current!.findNode('/kind')!.setValue(false));
      await act(() =>
        handle.current!.findNode('/current/a')!.setValue('changed'),
      );
      const result = handle.current!.findNode('/current/b')!.value;
      view.unmount();
      return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
  it('invalidates an alias reader when a watched subtree exits', async () => {
    const run = async (ref: boolean) => {
      const P: JSONSchema = {
        type: 'object',
        properties: {
          on: { type: 'boolean', default: true },
          branch: {
            type: 'object',
            controls: { active: '../on === true' },
            properties: { value: { type: 'string', default: 'v' } },
          },
          out: {
            type: 'string',
            controls: { derived: '(../branch/value) ?? "gone"' },
          },
        },
      };
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          jsonSchema={{
            type: 'object',
            $defs: { P },
            properties: {
              x: ref ? { $ref: '#/$defs/P' } : P,
              y: ref ? { $ref: '#/$defs/P' } : P,
            },
          }}
          validationMode={ValidationMode.None}
        />,
      );
      await act(() => handle.current!.findNode('/y/on')!.setValue(false));
      const value = handle.current!.findNode('/y/out')!.value;
      view.unmount();
      return value;
    };
    const inline = await run(false);
    expect(inline).toBe('gone');
    expect(await run(true)).toBe(inline);
  });
});
