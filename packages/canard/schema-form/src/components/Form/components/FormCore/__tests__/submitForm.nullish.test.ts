import { expect, it, vi } from 'vitest';

import { submitForm } from '../utils/submitForm';

it.each([null, undefined])(
  'resolves an absent root (%s) without invoking callbacks',
  async (root) => {
    const onSubmit = vi.fn();
    const onFailure = vi.fn();
    const onInvalid = vi.fn();
    await expect(
      submitForm(root, onSubmit, onFailure, onInvalid),
    ).resolves.toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
  },
);
