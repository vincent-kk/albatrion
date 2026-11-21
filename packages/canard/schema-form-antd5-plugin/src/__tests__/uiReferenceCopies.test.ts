import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('keeps the independent reference models identical across UI plugins', () => {
  const folder = 'src/__tests__/utils/sliderReference';
  const helpers = readdirSync(resolve(folder)).map(
    (file) => `sliderReference/${file}`,
  );
  for (const model of [
    'sliderReference.ts',
    'fieldNameReference.ts',
    'fieldLabelLifecycle.ts',
    'fieldLabelPresence.ts',
    'fieldLabelSemantics.ts',
    ...helpers,
  ]) {
    const file = `src/__tests__/utils/${model}`;
    const canonical = readFileSync(resolve(file), 'utf8');
    for (const plugin of ['antd6', 'antd-mobile', 'mui']) {
      const copy = resolve(`../schema-form-${plugin}-plugin/${file}`);
      expect(readFileSync(copy, 'utf8'), `${plugin}/${model}`).toBe(canonical);
    }
  }
});
