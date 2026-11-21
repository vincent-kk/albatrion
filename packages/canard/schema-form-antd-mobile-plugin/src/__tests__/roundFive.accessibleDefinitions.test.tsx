import {
  cleanup,
  getRoles,
  isInaccessible,
  render,
  within,
} from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../index';
import { fieldCases as fields } from './utils/fieldCases';
import { fieldNameReference } from './utils/fieldNameReference';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/** Render the bound title without passing any naming attributes to the input. */
const Custom = ({ depth, Label, Input }: FieldRendererProps) =>
  depth === 0 ? (
    <Input />
  ) : (
    <div>
      <Label />
      <Input />
    </div>
  );

it.each(['plugin', 'standalone', 'custom', 'hideLabel'] as const)(
  'round-5 class 45: every definition names its controls in the %s layout',
  (layout) => {
    const failures: string[] = [];
    for (const definition of plugin.fieldInputDefinitions) {
      const kind = definition.Component.name;
      const entry = fields[kind];
      if (!entry) {
        failures.push(`unclassified definition: ${kind}`);
        continue;
      }
      let selected = false;
      const Component = definition.Component;
      const Capture = (props: FieldInputProps) => {
        if (props.path === '/field') selected = true;
        return <Component {...props} />;
      };
      const jsonSchema: JSONSchema = {
        type: 'object',
        properties: { field: { ...entry.schema, title: 'field' } },
      };
      const view = render(
        <Form
          jsonSchema={jsonSchema}
          fieldInputDefinitions={[{ ...definition, Component: Capture }]}
          FieldRenderer={layout === 'custom' ? Custom : plugin.FieldRenderer}
          LabelRenderer={plugin.LabelRenderer}
          ErrorMessageRenderer={plugin.ErrorMessageRenderer}
        >
          {layout === 'standalone' || layout === 'hideLabel' ? (
            <>
              <Form.Label path="/field" />
              <Form.Input path="/field" hideLabel={layout === 'hideLabel'} />
            </>
          ) : undefined}
        </Form>,
      );
      const report = (message: string) => failures.push(`${kind}: ${message}`);
      if (!selected) report('fixture did not select the definition');
      const primary = [
        ...view.container.querySelectorAll<HTMLElement>(entry.primary),
      ].filter((element) => !element.closest('[aria-hidden="true"]'));
      if (!primary.length) report('no primary control or composite');
      for (const element of primary)
        if (computeAccessibleName(element) !== 'field')
          report(
            `primary ${element.tagName} name=${computeAccessibleName(element)}`,
          );
      const focusable = [
        ...view.container.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]),textarea,select,button,[tabindex]',
        ),
      ].filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.hasAttribute('disabled') &&
          !element.hidden &&
          !element.closest('[aria-hidden="true"]'),
      );
      for (const control of focusable) {
        const classification = entry.controls.find((rule) =>
          control.matches(rule.selector),
        );
        if (!classification) {
          report(`unclassified control ${control.outerHTML.slice(0, 160)}`);
          continue;
        }
        const name = computeAccessibleName(control);
        if (!name || name === '开关')
          report(`unnamed/default-only ${classification.kind}`);
        if (
          classification.kind === 'primary' ||
          classification.kind === 'range-end'
        ) {
          if (name !== 'field') report(`${classification.kind} name=${name}`);
        } else {
          let linked = (control.getAttribute('aria-describedby') ?? '')
            .split(/\s+/)
            .some((id) =>
              document.getElementById(id)?.textContent?.includes('field'),
            );
          for (
            let parent = control.parentElement;
            parent && parent !== view.container;
            parent = parent.parentElement
          ) {
            if (
              parent.matches('fieldset,[role="group"],[role="radiogroup"]') &&
              computeAccessibleName(parent) === 'field'
            )
              linked = true;
          }
          if (!linked)
            report(`auxiliary ${name} has no named group or field description`);
        }
      }
      if (entry.choiceGroup) {
        const titles = [
          ...view.container.querySelectorAll<HTMLElement>('*'),
        ].filter(
          (element) =>
            element.textContent === 'field' &&
            ![...element.children].some(
              (child) => child.textContent === 'field',
            ) &&
            !isInaccessible(element),
        );
        if (titles.length !== 1)
          report(
            `group exposes ${titles.length} field titles to the accessibility tree`,
          );
      }
      const ids = [...view.container.querySelectorAll('[id]')].map(
        (element) => element.id,
      );
      if (new Set(ids).size !== ids.length) report('duplicate id');
      for (const element of view.container.querySelectorAll(
        '[aria-labelledby],[for]',
      )) {
        for (const attribute of ['aria-labelledby', 'for'])
          for (const id of (element.getAttribute(attribute) ?? '')
            .split(/\s+/)
            .filter(Boolean))
            if (!document.getElementById(id))
              report(`missing ${attribute} target ${id}`);
      }
      view.unmount();
    }
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  },
  120000,
);

it.each(['schema title', 'custom renderer', 'options', 'fallback'] as const)(
  'names every registered control from %s',
  (source) => {
    const key = 'internalKey';
    const title = source === 'schema title' ? 'Schema title' : undefined;
    const ariaLabel = source === 'options' ? 'Spoken caption' : undefined;
    const customLabel =
      source === 'custom renderer' ? 'Operator caption' : undefined;
    const labelText = fieldNameReference({
      visible: [customLabel ?? title ?? ''],
      title,
      ariaLabel,
      key,
    });
    for (const definition of plugin.fieldInputDefinitions) {
      const kind = definition.Component.name;
      const entry = fields[kind];
      expect(entry, kind).toBeDefined();
      const schemas =
        kind === 'FieldInputString'
          ? [
              entry.schema,
              { type: 'string', format: 'password' } satisfies JSONSchema,
            ]
          : [entry.schema];
      for (const schema of schemas) {
        const jsonSchema: JSONSchema = {
          type: 'object',
          properties: {
            [key]: {
              ...schema,
              ...(source === 'schema title' ? { title } : {}),
              ...(source === 'options'
                ? { options: { 'aria-label': ariaLabel } }
                : {}),
            },
          },
        };
        const NameRenderer = ({ depth, Label, Input }: FieldRendererProps) =>
          depth === 0 ? (
            <Input />
          ) : (
            <>
              <Label>{customLabel}</Label>
              <Input hideLabel />
            </>
          );
        const view = render(
          <Form
            jsonSchema={jsonSchema}
            fieldInputDefinitions={[definition]}
            FieldRenderer={
              source === 'custom renderer' ? NameRenderer : plugin.FieldRenderer
            }
            LabelRenderer={plugin.LabelRenderer}
            ErrorMessageRenderer={plugin.ErrorMessageRenderer}
          />,
        );
        const field = view.container.querySelector(
          '[data-path="/internalKey"]',
        );
        if (!(field instanceof HTMLElement)) throw new Error(kind);
        const controls = [
          ...field.querySelectorAll<HTMLElement>(entry.primary),
        ].filter((element) => !element.closest('[aria-hidden="true"]'));
        expect(controls.length, kind).toBeGreaterThan(0);
        const availableRoles = Object.entries(getRoles(field));
        for (const control of controls) {
          const role = availableRoles.find(([, elements]) =>
            elements.includes(control),
          )?.[0];
          if (control.matches('input[type="password"]')) {
            expect(within(field).getAllByLabelText(labelText)).toContain(
              control,
            );
          } else {
            expect(role, kind).toBeDefined();
            expect(
              within(field).queryAllByRole(role ?? '', { name: labelText }),
              kind,
            ).toContain(control);
          }
        }
        view.unmount();
      }
    }
  },
);

it.each([
  ['FieldInputStringCheckbox', 'checkbox'],
  ['FieldInputRadioGroup', 'radio'],
])('keeps the displayed alias in each %s option name', (kind, role) => {
  const entry = fields[kind];
  const definition = plugin.fieldInputDefinitions.find(
    ({ Component }) => Component.name === kind,
  );
  if (!definition) throw new Error(`Missing option definition ${kind}`);
  const schema = entry.schema;
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          internalKey: {
            ...schema,
            title: 'Choice group',
            presentation: {
              ...schema.presentation,
              FieldInputProps: { alias: { one: 'First choice' } },
            },
          },
        },
      }}
      fieldInputDefinitions={[definition]}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const name = fieldNameReference({ visible: ['First choice'], key: 'one' });
  expect(view.getByRole(role, { name })).toBeTruthy();
});

it('uses the authored name for a nested object container', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          internalKey: {
            type: 'object',
            title: 'Address details',
            properties: { street: { type: 'string' } },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const name = fieldNameReference({
    visible: ['Address details'],
    key: 'internalKey',
  });
  const group = view.getByRole('group', { name });
  expect(within(group).getByRole('textbox')).toBeTruthy();
});
