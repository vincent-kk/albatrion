// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

it('R12 imports without DOM and renders a provider with a zero active count', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const { ModalProvider, useActiveModalCount, useModalAnimation } =
      await import('../index');
    const Count = () => {
      useModalAnimation(true, {});
      return <output>{useActiveModalCount()}</output>;
    };
    expect(
      renderToString(
        <ModalProvider>
          <main>server</main>
          <Count />
        </ModalProvider>,
      ),
    ).toBe('<main>server</main><output>0</output>');
    const published = await import('@lerx/promise-modal');
    const PublishedCount = () => {
      published.useModalAnimation(true, {});
      return <output>{published.useActiveModalCount()}</output>;
    };
    expect(
      renderToString(
        <published.ModalProvider>
          <PublishedCount />
        </published.ModalProvider>,
      ),
    ).toBe('<output>0</output>');
    expect(error).not.toHaveBeenCalled();
  } finally {
    error.mockRestore();
  }
});
