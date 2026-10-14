import { act, createRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ScenarioAdapter } from '../../types';
import { findScenarioHandle } from '../../utils/findScenarioHandle';
import { ScenarioForm } from '../ScenarioForm';

// filid:contract scenario-registration
describe('ScenarioForm', () => {
  beforeAll(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true));
  afterAll(() => vi.unstubAllGlobals());

  it('injects a structural form and cleans up its DOM registration', async () => {
    const observed = createRef<{ value: unknown }>();
    const Form = forwardRef<{ value: unknown }, { jsonSchema: object; defaultValue?: unknown }>(
      ({ defaultValue }, ref) => {
        useImperativeHandle(ref, () => ({ value: defaultValue }), [defaultValue]);
        return <input data-path="/name" defaultValue={String(defaultValue)} />;
      },
    );
    const adapter: ScenarioAdapter = { execute() {}, assert() {} };
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(
      <ScenarioForm
        scenario={{ name: 'wrapper', schema: {}, initialValue: 'initial', steps: [] }}
        Form={Form}
        createAdapter={(handle) => { observed.current = handle; return adapter; }}
      />,
    ));
    expect(observed.current?.value).toBe('initial');
    const wrapper = container.firstElementChild!;
    expect(findScenarioHandle(container).handle).toBe(observed.current);
    await act(async () => root.unmount());
    expect(() => findScenarioHandle(wrapper)).toThrow('No scenario handle');
  });
});
