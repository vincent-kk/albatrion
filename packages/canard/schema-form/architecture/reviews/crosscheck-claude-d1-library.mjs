/**
 * D-1 crosscheck probe (Claude): where can record A's latent child values go
 * after record B (`target: null`) is loaded, in the CURRENT library?
 *
 * Not part of the package suite (named without `.test` so the package's vitest
 * glob skips it). Run it against a copy of src/ (see the crosscheck report):
 * copy this file to <copy>/src/__crosscheck__/<name>.test.mjs and run vitest
 * with a config that aliases '@/schema-form' to the copy. The copy's
 * ObjectNode BranchStrategy reads process.env.D1_VARIANT:
 *   unset → current behaviour (S4: children are blanked when the parent becomes null)
 *   P1    → skip the blank reset only (children keep raw, null-time record = schema default)
 *   P2    → skip the blank reset and seed the null-time record from the previous object
 *           (children keep raw, un-null composes from what the children hold)
 * Logs observations; asserts nothing, so every variant runs to the end.
 */
import '@testing-library/jest-dom'; // also polyfills CSS.escape, which renderForm uses
import { it } from 'vitest';

import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';
import { renderForm } from '@/schema-form/__tests__/renderForm';

const variant = process.env.D1_VARIANT || 'baseline';
const delay = (ms = 10) => new Promise((r) => setTimeout(r, ms));
const log = (probe, data) =>
  console.log(`D1[${variant}] ${probe} ${JSON.stringify(data)}`);

const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value) => (value ? { '../target/note': `from:${value}` } : {}),
    },
    target: {
      type: ['object', 'null'],
      properties: {
        note: { type: 'string' },
        reason: { type: 'string', default: 'because' },
        rows: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

const recordA = { target: { note: 'A-note', reason: 'A-reason', rows: ['A-row'] } };
const recordB = { target: null };

/** Builds a form, loads record A, then record B, both as whole-root writes (Overwrite). */
const loadAThenB = async () => {
  const root = nodeFromJSONSchema({ onChange: () => {}, jsonSchema: schema });
  await delay();
  root.setValue(recordA);
  await delay();
  root.setValue(recordB);
  await delay();
  return root;
};

it('L1 child node.value while the host is null', async () => {
  const root = await loadAThenB();
  log('L1', {
    root: root.value,
    note: root.find('target/note').value,
    reason: root.find('target/reason').value,
    rows: root.find('target/rows').value,
  });
});

it('L2 one child write under the null host', async () => {
  const root = await loadAThenB();
  root.find('target/note').setValue('B-note');
  await delay();
  log('L2', root.value);
});

it('L3 keyed Merge on the null host', async () => {
  const root = await loadAThenB();
  root.find('target').setValue({ note: 'B-note' }, SetValueOption.Merge);
  await delay();
  log('L3', root.value);
});

it('L4 Overwrite of an object on the null host', async () => {
  const root = await loadAThenB();
  root.find('target').setValue({ note: 'B-note' });
  await delay();
  log('L4', root.value);
});

it('L5 array push under the null host', async () => {
  const root = await loadAThenB();
  await root.find('target/rows').push('B-row');
  await delay();
  log('L5', root.value);
});

it('L6 injectTo from a user-changed source into the null host', async () => {
  const root = await loadAThenB();
  root.find('source').setValue('s');
  await delay();
  log('L6', root.value);
});

it('L7 record C without the key, after B, then a child write', async () => {
  const root = await loadAThenB();
  root.setValue({});
  await delay();
  const afterC = root.value;
  root.find('target/note').setValue('C-note');
  await delay();
  log('L7', { afterC, afterWrite: root.value });
});

it('L8 DOM while the host is null, then the user types into one field', async () => {
  const form = await renderForm(
    {
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: {
            note: { type: 'string' },
            reason: { type: 'string', default: 'because' },
          },
        },
      },
    },
    {},
  );
  await form.setValue({ target: { note: 'A-note', reason: 'A-reason' } });
  await form.setValue({ target: null });
  const whileNull = {
    getValue: form.getValue(),
    lastOnChange: form.lastValue(),
    domNoteExists: form.exists('/target/note'),
    domNote: form.value('/target/note'),
    domReason: form.value('/target/reason'),
  };
  await form.type('/target/note', 'B-note');
  log('L8', {
    whileNull,
    afterType: form.getValue(),
    lastOnChange: form.lastValue(),
    domReasonAfterType: form.value('/target/reason'),
  });
  form.unmount();
});
