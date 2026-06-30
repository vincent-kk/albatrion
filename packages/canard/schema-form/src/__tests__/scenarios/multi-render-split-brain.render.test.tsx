import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { Form } from '@/schema-form';
import type { FormTypeRendererProps } from '@/schema-form';
import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Multi-render split-brain (GAP-16) and coalesced child-set + value/error
 * (GAP-18), plus a DOM-level reproduction of the "RerenderRenderer" bug report
 * (stories/BugReport.01.RerenderRenderer.stories.tsx).
 *
 * GAP-16 — the same node is rendered in TWO DOM locations (two `Form.Render`
 * proxies bound to the same JSONPointer). The `node.value` getter has render-time
 * side effects (BatchedEmitChange when `__expired__`), so two components reading
 * the same node during one render pass could, in principle, observe DIFFERENT
 * values ("split-brain"). Every test asserts BOTH locations agree with each other
 * AND with the node tree after a change. Built-in UNCONTROLLED inputs are used so
 * the DOM `.value` only re-syncs via the `RequestRefresh` remount cascade — making
 * a desync between the two mirrors observable, not masked by a controlled read.
 *
 * GAP-18 — a single change that alters both the child set (oneOf branch) AND a
 * value/error. `SchemaNodeProxy` (value/error display) and `useChildNodeComponents`
 * (child list) subscribe to DIFFERENT event bits from the SAME merged batch; a
 * mask that drops one bit leaves the child list updated while the value/error lags
 * (or vice versa). Tests assert the child rows AND the value/error text update
 * together.
 *
 * Harness note: `renderForm` renders a bare `<Form>` (no FormProvider), so the
 * partial fallback renderers (FormInputRenderer/FormErrorRenderer/...) used by the
 * story's FormProvider are NOT auto-wired. We therefore reproduce the three
 * "Show*Only" stories with `Form.Render` render-prop isolation (Input-only /
 * errorMessage-only / name-only), which exercises the same single-renderer
 * re-render contract the story depends on.
 */

// ---------------------------------------------------------------------------
// Scoped DOM helpers (two locations render the SAME path → duplicate id={path})
// ---------------------------------------------------------------------------

const loc = (form: any, testId: string): HTMLElement | null =>
  form.container.querySelector(`[data-testid="${testId}"]`);

const locInput = (
  form: any,
  testId: string,
  path: string,
): HTMLInputElement | null => {
  const scope = loc(form, testId);
  return scope
    ? (scope.querySelector(`#${CSS.escape(path)}`) as HTMLInputElement | null)
    : null;
};

const locValue = (form: any, testId: string, path: string): string => {
  const el = locInput(form, testId, path);
  return el ? (el.value ?? '') : '';
};

const locExists = (form: any, testId: string, path: string): boolean => {
  const scope = loc(form, testId);
  return !!(scope && scope.querySelector(`[data-path="${path}"]`));
};

const text = (form: any, testId: string): string =>
  loc(form, testId)?.textContent?.trim() ?? '';

/** Two independent `Form.Render` proxies bound to the same path. */
const twoLocations = (path: string) => (
  <>
    <div data-testid="loc-a">
      <Form.Render path={path}>
        {({ Input }: FormTypeRendererProps) => <Input />}
      </Form.Render>
    </div>
    <div data-testid="loc-b">
      <Form.Render path={path}>
        {({ Input }: FormTypeRendererProps) => <Input />}
      </Form.Render>
    </div>
  </>
);

// ===========================================================================
// GAP-16 — split-brain across two render locations of the same node
// ===========================================================================
describe('GAP-16: same node rendered in two locations stays consistent', () => {
  it('initial mount: both string locations agree (two-phase: sync then flush)', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'init' } },
    };

    const form = await renderForm(schema, {
      children: twoLocations('/name'),
      flushOnMount: false,
    } as any);

    // Synchronous snapshot: whatever each mirror shows, the two must AGREE.
    expect(locValue(form, 'loc-a', '/name')).toBe(
      locValue(form, 'loc-b', '/name'),
    );

    await form.flush();

    // Settled: both mirrors equal the node-tree value (no split-brain).
    expect(form.node('/name')?.value).toBe('init');
    expect(locValue(form, 'loc-a', '/name')).toBe('init');
    expect(locValue(form, 'loc-b', '/name')).toBe('init');
    expect(locValue(form, 'loc-a', '/name')).toBe(
      locValue(form, 'loc-b', '/name'),
    );
    expect(form.caughtErrors()).toEqual([]);
  });

  it('Overwrite setValue updates both string locations identically', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'init' } },
    };

    const form = await renderForm(schema, {
      children: twoLocations('/name'),
    } as any);

    expect(locValue(form, 'loc-a', '/name')).toBe('init');
    expect(locValue(form, 'loc-b', '/name')).toBe('init');

    await form.setValue({ name: 'changed' }, SetValueOption.Overwrite);

    // node tree advanced; BOTH uncontrolled mirrors remounted to the new value
    expect(form.node('/name')?.value).toBe('changed');
    expect(form.getValue()?.name).toBe('changed');
    expect(locValue(form, 'loc-a', '/name')).toBe('changed');
    expect(locValue(form, 'loc-b', '/name')).toBe('changed');
    expect(locValue(form, 'loc-a', '/name')).toBe(
      locValue(form, 'loc-b', '/name'),
    );
    expect(form.caughtErrors()).toEqual([]);
  });

  it('Overwrite setValue updates both number locations identically', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { count: { type: 'number', default: 5 } },
    };

    const form = await renderForm(schema, {
      children: twoLocations('/count'),
    } as any);

    expect(locValue(form, 'loc-a', '/count')).toBe('5');
    expect(locValue(form, 'loc-b', '/count')).toBe('5');

    await form.setValue({ count: 42 }, SetValueOption.Overwrite);

    expect(form.node('/count')?.value).toBe(42);
    expect(locValue(form, 'loc-a', '/count')).toBe('42');
    expect(locValue(form, 'loc-b', '/count')).toBe('42');
    expect(locValue(form, 'loc-a', '/count')).toBe(
      locValue(form, 'loc-b', '/count'),
    );
  });

  it('nested object field is consistent in both locations after parent Overwrite', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: { name: { type: 'string', default: 'a' } },
        },
      },
    };

    const form = await renderForm(schema, {
      children: twoLocations('/user/name'),
    } as any);

    expect(locExists(form, 'loc-a', '/user/name')).toBe(true);
    expect(locExists(form, 'loc-b', '/user/name')).toBe(true);
    expect(locValue(form, 'loc-a', '/user/name')).toBe('a');
    expect(locValue(form, 'loc-b', '/user/name')).toBe('a');

    await form.setValue({ user: { name: 'zed' } }, SetValueOption.Overwrite);

    expect(form.node('/user/name')?.value).toBe('zed');
    expect(form.getValue()?.user?.name).toBe('zed');
    expect(locValue(form, 'loc-a', '/user/name')).toBe('zed');
    expect(locValue(form, 'loc-b', '/user/name')).toBe('zed');
    expect(locValue(form, 'loc-a', '/user/name')).toBe(
      locValue(form, 'loc-b', '/user/name'),
    );
    expect(form.caughtErrors()).toEqual([]);
  });
});

// ===========================================================================
// GAP-18 — one change alters both the child set AND a value/error together
// ===========================================================================
describe('GAP-18: coordinated child-set + value/error in a single change', () => {
  const oneOfSchema: JsonSchema = {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['game', 'movie'], default: 'game' },
    },
    oneOf: [
      {
        '&if': "./category === 'game'",
        properties: { platform: { type: 'string' } },
      },
      {
        '&if': "./category === 'movie'",
        properties: { director: { type: 'string', minLength: 3 } },
        required: ['director'],
      },
    ],
  };

  it('oneOf switch updates the rendered child set AND the discriminator value together', async () => {
    const form = await renderForm(oneOfSchema);

    // initial 'game' branch
    expect(form.exists('/platform')).toBe(true);
    expect(form.exists('/director')).toBe(false);
    expect(form.value('/category')).toBe('game');

    await form.setValue(
      { category: 'movie', director: 'Nolan' },
      SetValueOption.Overwrite,
    );

    // child set replaced AND discriminator value re-rendered in the same batch
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(true);
    expect(form.value('/category')).toBe('movie');
    expect(form.value('/director')).toBe('Nolan');
    // node tree agrees
    expect(form.getValue()?.category).toBe('movie');
    expect(form.getValue()?.director).toBe('Nolan');
    expect(form.getValue()?.platform).toBeUndefined();
    expect(form.caughtErrors()).toEqual([]);
  });

  it('oneOf switch updates the child set AND the error message together', async () => {
    const form = await renderForm(oneOfSchema, {
      validator: true,
      showError: true as any,
    });

    expect(form.exists('/director')).toBe(false);
    expect(form.errorTexts()).toEqual([]);

    // switch to movie with an invalid (too-short) director in ONE change
    await form.setValue(
      { category: 'movie', director: 'ab' },
      SetValueOption.Overwrite,
    );
    await form.flush();

    // child set changed (director appeared, platform gone)
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(true);
    // AND the error surfaced together with the new branch
    expect(form.errorTexts().length).toBeGreaterThan(0);
    const directorError = form
      .getErrors()
      .find((e) => e.dataPath === '/director');
    expect(directorError).toBeDefined();

    // fixing the value in one change clears the error while keeping the branch
    await form.setValue(
      { category: 'movie', director: 'Spielberg' },
      SetValueOption.Overwrite,
    );
    await form.flush();

    expect(form.exists('/director')).toBe(true);
    expect(form.value('/director')).toBe('Spielberg');
    expect(form.getErrors().some((e) => e.dataPath === '/director')).toBe(
      false,
    );
    expect(form.caughtErrors()).toEqual([]);
  });

  it('a single Form.Render mirror updates value AND errorMessage together', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        username: { type: 'string', minLength: 5, default: 'TEST' },
      },
    };

    const form = await renderForm(schema, {
      validator: true,
      showError: true as any,
      children: (
        <Form.Render path="/username">
          {({ Input, value, errorMessage }: FormTypeRendererProps) => (
            <div>
              <Input />
              <span data-testid="rv">{value == null ? '' : String(value)}</span>
              <span data-testid="re">{errorMessage ?? ''}</span>
            </div>
          )}
        </Form.Render>
      ),
    } as any);
    await form.flush();

    // 'TEST' (len 4) violates minLength 5 → value AND error both shown
    expect(text(form, 'rv')).toBe('TEST');
    expect(text(form, 're').length).toBeGreaterThan(0);
    expect(form.getErrors().length).toBeGreaterThan(0);

    // typing a valid value re-renders the mirror: value updates AND error clears
    await form.type('/username', 'HELLO');
    await form.flush();

    expect(form.node('/username')?.value).toBe('HELLO');
    expect(text(form, 'rv')).toBe('HELLO');
    expect(text(form, 're')).toBe('');
    expect(form.getErrors().length).toBe(0);
    expect(form.caughtErrors()).toEqual([]);
  });
});

// ===========================================================================
// BugReport.01 RerenderRenderer — single-renderer isolation at DOM level
// ===========================================================================
describe('RerenderRenderer: isolated single-renderer re-render contract', () => {
  const usernameSchema: JsonSchema = {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 5, default: 'TEST' },
    },
  };

  it('ShowFormInputOnly: input value re-renders on Overwrite while tree stays in sync', async () => {
    const form = await renderForm(usernameSchema, {
      children: (
        <div data-testid="only-input">
          <Form.Render path="/username">
            {({ Input }: FormTypeRendererProps) => <Input />}
          </Form.Render>
        </div>
      ),
    } as any);

    expect(locValue(form, 'only-input', '/username')).toBe('TEST');
    expect(form.node('/username')?.value).toBe('TEST');

    await form.setValue({ username: 'RENEWED' }, SetValueOption.Overwrite);

    // the isolated Input renderer re-rendered/remounted to the new value
    expect(form.node('/username')?.value).toBe('RENEWED');
    expect(locValue(form, 'only-input', '/username')).toBe('RENEWED');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('ShowFormErrorOnly: isolated error renderer reflects validity transitions', async () => {
    const form = await renderForm(usernameSchema, {
      validator: true,
      showError: true as any,
      children: (
        <span data-testid="only-error">
          <Form.Render path="/username">
            {({ errorMessage }: FormTypeRendererProps) => (
              <em>{errorMessage ?? ''}</em>
            )}
          </Form.Render>
        </span>
      ),
    } as any);
    await form.flush();

    // invalid default 'TEST' → error visible in the isolated error renderer
    expect(text(form, 'only-error').length).toBeGreaterThan(0);
    expect(form.errorTexts().length).toBeGreaterThan(0);
    expect(form.getErrors().length).toBeGreaterThan(0);

    await form.setValue({ username: 'VALIDLONG' }, SetValueOption.Overwrite);
    await form.flush();

    // valid value → error renderer cleared in DOM and tree together
    expect(form.node('/username')?.value).toBe('VALIDLONG');
    expect(text(form, 'only-error')).toBe('');
    expect(form.errorTexts()).toEqual([]);
    expect(form.getErrors().length).toBe(0);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('ShowFormLabelOnly: isolated label renderer shows the field name', async () => {
    const form = await renderForm(usernameSchema, {
      children: (
        <span data-testid="only-label">
          <Form.Render path="/username">
            {({ name }: FormTypeRendererProps) => <b>{name}</b>}
          </Form.Render>
        </span>
      ),
    } as any);

    // isolated label renderer mounts cleanly and shows the property name
    expect(text(form, 'only-label')).toBe('username');
    expect(form.node('/username')).not.toBeNull();
    expect(form.caughtErrors()).toEqual([]);
  });
});
