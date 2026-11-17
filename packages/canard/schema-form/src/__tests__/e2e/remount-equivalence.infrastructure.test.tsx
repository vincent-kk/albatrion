import { beforeEach, expect, it } from 'vitest';

import { readDomObservation } from './remount-equivalence/helpers/readDomObservation';

it('compares live input properties independently of initial attributes and mount counters', () => {
  const updated = document.createElement('div');
  const fresh = document.createElement('div');
  updated.innerHTML =
    '<input value="old" data-mount="1"><input type="checkbox" checked>';
  fresh.innerHTML = '<input value="new" data-mount="2"><input type="checkbox">';
  updated.querySelector('input')!.value = 'new';
  updated.querySelectorAll('input')[1].checked = false;
  expect(readDomObservation(updated)).toEqual(readDomObservation(fresh));
});

it('retains disabled state, current values and child order differences', () => {
  const updated = document.createElement('div');
  const fresh = document.createElement('div');
  updated.innerHTML = '<input value="a" disabled><span>A</span>';
  fresh.innerHTML = '<input value="a"><span>A</span>';
  expect(readDomObservation(updated)).not.toEqual(readDomObservation(fresh));
  updated.querySelector('input')!.disabled = false;
  updated.querySelector('input')!.value = 'b';
  expect(readDomObservation(updated)).not.toEqual(readDomObservation(fresh));
});

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
