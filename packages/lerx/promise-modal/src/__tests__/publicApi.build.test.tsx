import type { PropsWithChildren } from 'react';

import {
  type ModalFrameProps,
  type ModalNodeView,
  ModalProvider,
  alert,
  confirm,
  prompt,
  useActiveModalCount,
  useSubscribeModal,
} from '@lerx/promise-modal';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Exercises the built `dist/` output rather than `src/`.
 *
 * Importing by the published specifier resolves through package.json `exports`,
 * so this is the only suite that runs what consumers actually install. Every
 * other test in this package imports through the `@/promise-modal` alias or
 * relatively, and therefore only ever sees `src/`.
 *
 * What it guards: this package publishes a single bundled file, and bundling is
 * where module-evaluation semantics can shift — DOM-independent module evaluation, class declaration form, and
 * dead-code elimination. Driving one real modal round-trip through the bundle
 * covers all three; a surface-only check would not.
 *
 * Uses only the published surface on purpose: the singleton reset helper the
 * source tests call is internal, so cases here must tolerate shared state.
 */
describe('@lerx/promise-modal 빌드 산출물', () => {
  afterEach(cleanup);

  it('published entry point 가 문서화된 API 를 노출한다', () => {
    expect(typeof alert).toBe('function');
    expect(typeof confirm).toBe('function');
    expect(typeof prompt).toBe('function');
    expect(ModalProvider).toBeTruthy();
  });

  it('alert() 이 렌더되고 Confirm 클릭 시 resolve 된다', async () => {
    render(<ModalProvider>{null}</ModalProvider>);

    let pending!: Promise<void>;
    act(() => {
      pending = alert({ title: 'Built Alert' });
    });

    const confirmButton = await screen.findByText('Confirm');
    expect(screen.getByText('Built Alert')).toBeDefined();

    fireEvent.click(confirmButton);
    await expect(pending).resolves.toBeUndefined();
  });
});

/** Exercises the published read-only predicate and id subscription contracts. */
function PublicFrame({ id, children }: PropsWithChildren<ModalFrameProps>) {
  const version = useSubscribeModal(id);
  return (
    <section data-testid="public-frame" data-version={version}>
      {children}
    </section>
  );
}

it('published hooks count and subscribe from their public arguments', async () => {
  const Count = () => (
    <output>
      {useActiveModalCount(
        (node: ModalNodeView) => node.visible && node.group === 'public',
      )}
    </output>
  );
  render(
    <ModalProvider ForegroundComponent={PublicFrame}>
      <Count />
    </ModalProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('0');
  let result!: Promise<void>;
  act(() => {
    result = alert({ group: 'public' });
  });
  expect(screen.getByRole('status').textContent).toBe('1');
  const initial = screen.getByTestId('public-frame').dataset.version;
  fireEvent.click(screen.getByText('Confirm'));
  await expect(result).resolves.toBeUndefined();
  expect(screen.getByRole('status').textContent).toBe('0');
  expect(screen.getByTestId('public-frame').dataset.version).not.toBe(initial);
});
