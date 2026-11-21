import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
    da: { type: 'number', controls: { derived: '(../a ?? 0) * 2' } },
    db: { type: 'number', controls: { derived: '(../b ?? 0) * 2' } },
    src: {
      type: 'string',
      controls: { injectTo: (value: unknown) => ({ '../copy': value }) },
    },
    copy: { type: 'string' },
  },
} as const;

const load = () => ({ a: 1, b: 1, src: 's', copy: 's' });

const run = (mode: 'sequential' | 'batch', calls: (root: any) => void, extra: any = {}) => {
  const { root } = build(schema, load(), extra);
  if (mode === 'batch') root.batch(() => calls(root));
  else calls(root);
  return root.value;
};

describe('WRITE-015 an automatic-write option stays inside its own call in a batch', () => {
  it('W1 DisableAutomaticWrites on one write does not suppress derived values of another write', () => {
    const calls = (root: any) => {
      root.find('/a').setValue(5, SetValueOption.DisableAutomaticWrites);
      root.find('/b').setValue(7);
    };
    const sequential = run('sequential', calls);
    const batched = run('batch', calls);
    diag('W1', { sequential, batched });
    expect(batched).toEqual(sequential);
  });

  it('W2 DisableAutomaticWrites on one write does not suppress injectTo of another write', () => {
    const calls = (root: any) => {
      root.find('/a').setValue(5, SetValueOption.DisableAutomaticWrites);
      root.find('/src').setValue('t');
    };
    const sequential = run('sequential', calls);
    const batched = run('batch', calls);
    diag('W2', { sequential, batched });
    expect(batched).toEqual(sequential);
  });

  it('W3 EnableAutomaticWrites on one write does not enable automatic writes of another write on a suppressing form', () => {
    const calls = (root: any) => {
      root.find('/a').setValue(5, SetValueOption.EnableAutomaticWrites);
      root.find('/b').setValue(7);
    };
    const extra = { disableAutomaticWrites: true };
    const sequential = run('sequential', calls, extra);
    const batched = run('batch', calls, extra);
    diag('W3', { sequential, batched });
    expect(batched).toEqual(sequential);
  });

  it('W5 EnableAutomaticWrites on one write does not let injectTo of another write overwrite an edited target on a suppressing form', () => {
    const calls = (root: any) => {
      root.find('/a').setValue(5, SetValueOption.EnableAutomaticWrites);
      root.find('/src').setValue('t');
    };
    const extra = { disableAutomaticWrites: true };
    const edited = (mode: 'sequential' | 'batch') => {
      const { root } = build(schema, load(), extra);
      root.find('/copy').setValue('user-edited');
      if (mode === 'batch') root.batch(() => calls(root));
      else calls(root);
      return root.value;
    };
    const sequential = edited('sequential');
    const batched = edited('batch');
    diag('W5', { sequential, batched });
    expect(batched.copy).toBe('user-edited');
  });

  it('W4 control: the same two writes without options agree', () => {
    const calls = (root: any) => {
      root.find('/a').setValue(5);
      root.find('/b').setValue(7);
    };
    expect(run('batch', calls)).toEqual(run('sequential', calls));
  });
});
