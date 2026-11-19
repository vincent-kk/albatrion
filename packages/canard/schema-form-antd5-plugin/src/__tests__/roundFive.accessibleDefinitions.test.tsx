import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../index';

type Classification = {
  kind: 'primary' | 'range-end' | 'auxiliary';
  selector: string;
};
type InputCase = {
  schema: JSONSchema;
  primary: string;
  controls: Classification[];
};
const single: Classification[] = [
  {
    kind: 'primary',
    selector:
      'input:not([type="hidden"]),textarea,select,[role="combobox"],[role="switch"],[role="slider"]',
  },
  { kind: 'auxiliary', selector: 'button' },
];
const group: Classification[] = [
  {
    kind: 'auxiliary',
    selector: 'input,button,[role="checkbox"],[role="radio"]',
  },
];
const fields: Record<string, InputCase> = {
  FieldInputBooleanSwitch: {
    schema: { type: 'boolean', presentation: { inputType: 'switch' } },
    primary: '[role="switch"]',
    controls: single,
  },
  FieldInputStringSwitch: {
    schema: {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    primary: '[role="switch"]',
    controls: single,
  },
  FieldInputStringCheckbox: {
    schema: {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    primary: '[role="group"],fieldset',
    controls: group,
  },
  FieldInputRadioGroup: {
    schema: {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
    primary: '[role="radiogroup"]',
    controls: group,
  },
  FieldInputStringEnum: {
    schema: { type: 'string', enum: ['one', 'two'] },
    primary: '[role="combobox"]',
    controls: single,
  },
  FieldInputUri: {
    schema: { type: 'string', format: 'uri' },
    primary: 'input:not([type="hidden"]):not([role="combobox"])',
    controls: [
      { kind: 'auxiliary', selector: '[role="combobox"],button' },
      { kind: 'primary', selector: 'input:not([type="hidden"])' },
    ],
  },
  FieldInputMonth: {
    schema: { type: 'string', format: 'month' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputDate: {
    schema: { type: 'string', format: 'date' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputTime: {
    schema: { type: 'string', format: 'time' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputMonthRange: {
    schema: {
      type: 'array',
      format: 'month-range',
      items: { type: 'string', format: 'month' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputDateRange: {
    schema: {
      type: 'array',
      format: 'date-range',
      items: { type: 'string', format: 'date' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputTimeRange: {
    schema: {
      type: 'array',
      format: 'time-range',
      items: { type: 'string', format: 'time' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputArray: {
    schema: { type: 'array', items: { type: 'string' } },
    primary: 'fieldset,[role="group"]',
    controls: [{ kind: 'auxiliary', selector: 'button,input' }],
  },
  FieldInputSlider: {
    schema: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
    primary: '[role="slider"]',
    controls: single,
  },
  FieldInputTextarea: {
    schema: { type: 'string', format: 'textarea' },
    primary: 'textarea',
    controls: single,
  },
  FieldInputString: {
    schema: { type: 'string' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputNumber: {
    schema: { type: 'number' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputBoolean: {
    schema: { type: 'boolean' },
    primary: 'input[type="checkbox"],[role="checkbox"]',
    controls: single,
  },
};

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
      ];
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
          !element.hidden,
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
