import { StrictMode, Suspense, startTransition } from 'react';

import { act, render } from '@testing-library/react';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import type { FieldProxyProps } from '@/schema-form/components/FieldProxy/type';

import { useChildFields } from '../../hooks/useChildFields';
import type { ChildField } from '../../type';

/** Exercises discarded and committed hook state without inspecting or replacing its cache. */
export function createChildCacheSuspension(
  strict: boolean,
  initiallyBlocked = false,
) {
  const parent = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: ['a', 'b'],
  });
  let fields: ChildField[] = [];
  let blocked = initiallyBlocked;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const mounted = { current: 0 };
  const terminal: ChildField[] = [];
  const Proxy = ({ node }: FieldProxyProps) => (
    <input defaultValue={String(node?.value ?? '')} />
  );
  const Probe = () => {
    [fields] = useChildFields(parent, Proxy, mounted, terminal);
    if (blocked) throw pending;
    return (
      <>
        {fields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const element = () => {
    const boundary = (
      <Suspense fallback={<span>Waiting</span>}>
        <Probe />
      </Suspense>
    );
    return strict ? <StrictMode>{boundary}</StrictMode> : boundary;
  };
  const view = render(element());
  return {
    ...view,
    parent,
    fields: () => fields,
    mounted,
    suspend: () => {
      blocked = true;
      view.rerender(element());
    },
    attempt: () => {
      blocked = true;
      startTransition(() => view.rerender(element()));
    },
    resume: async () => {
      blocked = false;
      await act(async () => {
        release();
        view.rerender(element());
      });
    },
    rerenderProbe: () => view.rerender(element()),
  };
}
