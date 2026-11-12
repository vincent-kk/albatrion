// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

it('R12 imports without DOM and renders a provider with a zero active count', async () => {
  const { ModalProvider, useActiveModalCount } = await import('../index');
  const Count = () => <output>{useActiveModalCount()}</output>;
  expect(
    renderToString(
      <ModalProvider>
        <main>server</main>
        <Count />
      </ModalProvider>,
    ),
  ).toBe('<main>server</main><output>0</output>');
  const published = await import('@lerx/promise-modal');
  const PublishedCount = () => (
    <output>{published.useActiveModalCount()}</output>
  );
  expect(
    renderToString(
      <published.ModalProvider>
        <PublishedCount />
      </published.ModalProvider>,
    ),
  ).toBe('<output>0</output>');
});
