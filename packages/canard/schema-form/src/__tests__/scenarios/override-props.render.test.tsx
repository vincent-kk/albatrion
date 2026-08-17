import { useState } from 'react';

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Form, type FormTypeInputProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Component-level override props on `Form.Input` / `Form.Render`.
 *
 * This is a different seam from `schema-props-renderer`, which covers schema-level
 * `jsonSchema.FormTypeInputProps`. Here the props come from the JSX call site:
 * `FormInput` destructures `path`/`FormTypeInput` and funnels every remaining prop into
 * `overridePropsRef` (`useReference(restProps)`), which `SchemaNodeInputWrapper` merges
 * into `useSnapshot({ ...overrideFormTypeInputPropsRef?.current, ...preferredOverrideProps })`
 * before `SchemaNodeInput` spreads the result into the FormTypeInput.
 *
 * Dropping the last such prop makes that snapshot input an empty object, which is the
 * transition `useSnapshotReference` mishandled before @winglet/react-utils 5aade140: the
 * snapshot kept its previous contents, so an override prop could be changed but never
 * removed. Removal and replacement are asserted together because only removal regressed —
 * replacement worked throughout, and that asymmetry is what made the defect hard to see.
 */

const SCHEMA = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

type ProbeProps = FormTypeInputProps<string> & { badge?: string };

/** Renders whichever override props arrived, so their absence is observable in the DOM. */
const Probe = ({ badge }: ProbeProps) => (
  <span data-testid="badge">{badge ?? 'none'}</span>
);

/**
 * Mounts `Form.Input` with a `badge` override, then swaps it for `next` on demand —
 * `undefined` drops the prop entirely, which is the empty-object transition.
 */
const ToggleBadge = ({ next }: { next?: string }) => {
  const [swapped, setSwapped] = useState(false);
  const badge = swapped ? next : 'A';
  return (
    <>
      <button type="button" data-testid="swap" onClick={() => setSwapped(true)}>
        swap
      </button>
      {badge === undefined ? (
        <Form.Input path="/name" FormTypeInput={Probe} />
      ) : (
        <Form.Input path="/name" FormTypeInput={Probe} badge={badge} />
      )}
    </>
  );
};

describe('override-props: Form.Input override prop lifecycle', () => {
  it('drops an override prop once the call site stops passing it', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: <ToggleBadge />,
      } as any,
    );

    expect(screen.getByTestId('badge')).toHaveTextContent('A');

    await form.user.click(screen.getByTestId('swap'));
    await form.flush();

    expect(screen.getByTestId('badge')).toHaveTextContent('none');
  });

  it('applies a replacement override prop', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: <ToggleBadge next="B" />,
      } as any,
    );

    expect(screen.getByTestId('badge')).toHaveTextContent('A');

    await form.user.click(screen.getByTestId('swap'));
    await form.flush();

    expect(screen.getByTestId('badge')).toHaveTextContent('B');
  });
});
