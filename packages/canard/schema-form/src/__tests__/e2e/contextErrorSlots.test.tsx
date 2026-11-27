import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { field: { type: 'string', controls: { watch: ['@'] } } },
} as const;

/** An error with an own non-enumerable cause, as the ES2022 constructor option creates it. */
const errorWithCause = (cause: string): Error =>
  Object.defineProperty(new Error('fail'), 'cause', {
    value: cause,
    writable: true,
    configurable: true,
  });
/** An AggregateError, read from the global because the package's type library predates it. */
const aggregate = (message: string): Error =>
  Reflect.construct(Reflect.get(globalThis, 'AggregateError'), [
    [new Error(message)],
    'fail',
  ]);

it.each([
  ['cause', errorWithCause('one'), errorWithCause('two')],
  ['errors', aggregate('one'), aggregate('two')],
] as const)(
  'delivers a context whose error differs only in %s to watching inputs',
  async (_slot, first, second) => {
    const seen: unknown[] = [];
    const Probe = ({ node }: FieldInputProps<string>) => {
      seen.push((node.watchValues?.[0] as { error?: unknown })?.error);
      return null;
    };
    const view = render(
      <Form
        jsonSchema={schema}
        context={{ error: first }}
        fieldInputMap={{ '/field': Probe }}
      />,
    );
    expect(seen.at(-1)).toBe(first);
    await act(async () =>
      view.rerender(
        <Form
          jsonSchema={schema}
          context={{ error: second }}
          fieldInputMap={{ '/field': Probe }}
        />,
      ),
    );
    expect(seen.at(-1)).toBe(second);
  },
);
