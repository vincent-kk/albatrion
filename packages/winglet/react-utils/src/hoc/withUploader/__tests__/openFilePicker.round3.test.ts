import { expect, it, vi } from 'vitest';

import { openFilePicker } from '../utils/openFilePicker';

it('round-3 react-utils 5: picker activation preserves its control and position even when it throws', () => {
  const parent = document.createElement('div');
  const input = document.createElement('input');
  input.type = 'file';
  const sibling = document.createElement('span');
  parent.append(input, sibling);
  const failure = new Error('picker unavailable');
  const click = vi.spyOn(input, 'click').mockImplementation(() => {
    expect(input.parentNode).toBeNull();
    throw failure;
  });
  expect(() => openFilePicker(input)).toThrow(failure);
  expect([...parent.children]).toEqual([input, sibling]);
  click.mockRestore();
});
