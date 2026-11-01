// Loaded by the state-vocabulary report bundle; the product alias selects B or F.
import { getStageClosingFixture } from '../../../../fixtures/input-responsiveness/getStageClosingFixture';
import { afterPaint } from '../afterPaint';
import { mountFixture } from '../mountFixture';
import { observePage } from '../observePage';
import type { DivergentRead } from './reportTypes';

/** Browser-owned form state is created once for each report page. */
let mounted: Awaited<ReturnType<typeof mountFixture>> | undefined;
window.__svReport = {
  async prepare() {
    const container = document.getElementById('root');
    if (!container) throw new Error('Missing report root');
    const fixture = getStageClosingFixture('type-flat-2000-validate-nonburst');
    mounted = await mountFixture(
      container,
      { ...fixture, validation: false, validationMode: 0 },
      observePage(container),
    );
    await afterPaint();
  },
  async edit(count) {
    if (!mounted) throw new Error('Prepare before editing');
    const fixture = getStageClosingFixture('type-flat-2000-validate-nonburst');
    const target = mounted.currentHandle().findNode(fixture.target);
    if (!target) throw new Error('Missing report edit target');
    for (let index = 0; index < count; index++)
      target.setValue('state-vocabulary-edit-' + index);
    await afterPaint();
  },
  read(): DivergentRead {
    const node = mounted?.currentHandle().node;
    if (!node) throw new Error('Missing report node');
    if (!('isDivergent' in node))
      return { status: 'skipped', reason: 'build has no isDivergent getter' };
    const start = performance.now();
    const first: unknown = Reflect.get(node, 'isDivergent');
    const firstMs = performance.now() - start;
    const repeatStart = performance.now();
    const repeated: unknown = Reflect.get(node, 'isDivergent');
    const repeatedMs = performance.now() - repeatStart;
    if (typeof first !== 'boolean' || typeof repeated !== 'boolean')
      throw new Error('isDivergent must be boolean');
    return { status: 'ran', firstMs, repeatedMs, first, repeated };
  },
};
