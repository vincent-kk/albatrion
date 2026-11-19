import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import * as coreViaPackage from '@canard/schema-form';
import * as coreViaSource from '../../../../schema-form/src/index';
import * as arrayViaPackage from '@winglet/common-utils/array';
import * as arrayViaSource from '../../../../../winglet/common-utils/src/utils/array/index';
import * as filterViaPackage from '@winglet/json-schema/filter';
import * as filterViaSource from '../../../../../winglet/json-schema/src/filters/index';
import * as hookViaPackage from '@winglet/react-utils/hook';
import * as hookViaSource from '../../../../../winglet/react-utils/src/hooks/index';

import { plugin } from '../../index';

afterEach(cleanup);

it('control: the core and the winglet packages the plugin imports load from src', () => {
  expect(coreViaPackage).toBe(coreViaSource);
  expect(arrayViaPackage).toBe(arrayViaSource);
  expect(filterViaPackage).toBe(filterViaSource);
  expect(hookViaPackage).toBe(hookViaSource);
});

it('control: the round 3 Form-scoped id reaches the input and its label', () => {
  const { container } = render(
    <coreViaPackage.Form
      jsonSchema={{ type: 'object', properties: { text: { type: 'string' } } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      onError={() => {}}
    />,
  );
  const input = container.querySelector<HTMLInputElement>('[data-path="/text"] input')!;
  const label = container.querySelector<HTMLLabelElement>('[data-path="/text"] label')!;
  expect(input.id).toMatch(/^.+:\/text$/);
  expect(label.htmlFor).toBe(input.id);
  expect(label.id).toBe('label:' + input.id);
});
