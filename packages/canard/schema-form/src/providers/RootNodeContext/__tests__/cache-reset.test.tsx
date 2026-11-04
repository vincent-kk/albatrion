import { createRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type FormHandle } from '@/schema-form/components/Form';
const analysis = (handle: FormHandle) => (handle.node as unknown as { runtime: { blueprint: object } }).runtime.blueprint;
afterEach(cleanup);
it('mounts a fresh blueprint after CacheManager.reset without changing a live form', async () => {
  const { CacheManager } = await import('@/schema-form/app/cache');
  const schema = { type: 'string' as const };
  const a = createRef<FormHandle>();
  const b = createRef<FormHandle>();
  render(<Form ref={a} jsonSchema={schema} />);
  const old = analysis(a.current!);
  CacheManager.reset();
  render(<Form ref={b} jsonSchema={schema} />);
  expect(analysis(a.current!)).toBe(old);
  expect(analysis(b.current!)).not.toBe(old);
});
