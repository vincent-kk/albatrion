import { Suspense, lazy, startTransition } from 'react';

import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FormTypeInputProps, JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/** Drive lazy retry and transition through the actual input proxy. */
const run = async (strictMode: boolean, transition: boolean) => {
  let release!: () => void;
  const attempts: string[] = [];
  const LazyInput = lazy(() => new Promise<{ default: typeof Input }>((resolve) => {
    release = () => resolve({ default: Input });
  }));
  const Input = ({ path, value, onChange }: FormTypeInputProps) => {
    attempts.push(path);
    return <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
  };
  const DeferredInput = (props: FormTypeInputProps) => <Suspense fallback={<span data-pending>pending</span>}><LazyInput {...props} /></Suspense>;
  const schema: JSONSchema = {
    type: 'object', properties: { kind: { type: 'string' } }, oneOf: [
      { controls: { active: './kind === "a"' }, properties: { a: { type: 'string', default: 'A', presentation: { FormTypeInput: DeferredInput } } } },
      { controls: { active: './kind === "b"' }, properties: { b: { type: 'string', default: 'B' } } },
    ],
  };
  const form = await renderForm(schema, { defaultValue: { kind: 'a' }, strictMode });
  try {
    expect(form.container.querySelector('[data-pending]')).not.toBeNull();
    expect(form.getValue()).toEqual({ kind: 'a', a: 'A' });
    if (transition) {
      await act(async () => { startTransition(() => form.handle.setValue({ kind: 'b', b: 'committed' })); });
      expect(form.exists('/b')).toBe(true);
      expect(form.exists('/a')).toBe(false);
    }
    await act(async () => { release(); });
    if (transition) {
      expect(form.value('/b')).toBe('committed');
      expect(form.field('/a')).toBeNull();
      expect(form.handle.node!.children?.map((node) => node.name)).toEqual(['kind', 'b']);
    } else {
      expect(attempts).toContain('/a');
      expect(form.value('/a')).toBe('A');
      expect(form.handle.node!.children?.map((node) => node.name)).toEqual(['kind', 'a']);
    }
    expect(form.changeLog()).toHaveLength(transition ? 1 : 0);
  } finally { form.unmount(); }
};

describe('LANDING-004 / LANDING-022 / LANDING-038 concurrent mount disposition', () => {
  it('LANDING-038 lazy retry commits the explicitly selected child DOM', async () => { await run(false, false); });
  it('LANDING-038 StrictMode lazy retry commits the explicitly selected child DOM', async () => { await run(true, false); });
  it('LANDING-004 transition replaces a suspended branch without resurrecting its child', async () => { await run(false, true); });
  it('LANDING-022 StrictMode transition notifies only the committed branch change', async () => { await run(true, true); });
});
