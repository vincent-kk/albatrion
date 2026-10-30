// Bundled by runInteractions with one lane alias; browser clocks and DOM are runtime inputs.
import { flushSync } from 'react-dom';

import { getInputFixture } from '../../fixtures/input-responsiveness/getInputFixture';
import { afterPaint } from './helpers/afterPaint';
import { mountFixture } from './helpers/mountFixture';
import { observePage } from './helpers/observePage';

const container = document.getElementById('root')!;
const observation = observePage(container);
let mounted: Awaited<ReturnType<typeof mountFixture>>;
let fixture: ReturnType<typeof getInputFixture>;
let started = 0;

window.__ir0 = {
  async prepare(id) {
    fixture = getInputFixture(id, __IR0_LANE__);
    mounted = await mountFixture(container, fixture, observation);
    await new Promise((resolve) => setTimeout(resolve, 150));
    return fixture;
  },
  begin() {
    started = observation.begin();
    if (fixture.mount && mounted.mount.startedAt !== undefined)
      started = mounted.mount.startedAt;
  },
  async replace() {
    const items = Array.from({ length: 200 }, (_, index) => ({
      id: `s-${index}`,
      name: `item-${index}`,
      active: index % 2 === 0,
    }));
    const start = performance.now();
    flushSync(() => mounted.handle.findNode('/items')!.setValue(items));
    performance.measure('replace-200', { start, end: performance.now() });
    await afterPaint();
  },
  async finish() {
    if (fixture.virtualization && !fixture.mount) {
      const deadline = performance.now() + 30000;
      while (container.querySelector('[data-deferred]')) {
        if (performance.now() > deadline)
          throw new Error('Structural reveal timeout');
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      await afterPaint();
    }
    const end = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await afterPaint();
    observation.stop();
    return {
      start: started,
      end,
      observedUntil: performance.now(),
      events: observation.events,
      firstInputs: observation.firstInputs,
      frames: observation.frames,
      handlers: observation.handlers,
      validations: observation.validations,
      supported: observation.supported,
      mount: mounted.mount,
      final: {
        inputs: container.querySelectorAll('input,select').length,
        counter: Number(document.getElementById('parent-counter')!.textContent),
        targetValue: fixture.mount
          ? ''
          : String(mounted.handle.findNode(fixture.target)!.value),
        branch:
          fixture.id === 'switch-oneOf-20'
            ? JSON.stringify(mounted.handle.getValue())
            : null,
      },
    };
  },
};
