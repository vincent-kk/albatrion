import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

const packageDir = resolve(__dirname, '../../..');

/**
 * Imports an entry in a host that has ES2020 but not the ES2021 WeakRef and
 * FinalizationRegistry globals, as Safari 14.0 (iOS 14.0 to 14.4) does.
 */
const importWithoutWeakRefs = async (entry: string) => {
  vi.resetModules();
  vi.stubGlobal('FinalizationRegistry', undefined);
  vi.stubGlobal('WeakRef', undefined);
  try {
    await import(entry);
    return 'loaded';
  } catch (error) {
    return `threw ${(error as Error).name}: ${(error as Error).message}`;
  }
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('r4-contracts ajv8 plugin in a documented ES2020 browser', () => {
  it('control: the default entry loads where the ES2021 globals exist', async () => {
    vi.resetModules();
    await expect(import('../../default/index')).resolves.toBeDefined();
  });

  it('the default entry loads in an ES2020 host without WeakRef and FinalizationRegistry (README: Safari 14+)', async () => {
    expect(await importWithoutWeakRefs('../../default/index')).toBe('loaded');
  });

  it('the 2020 entry loads in an ES2020 host without WeakRef and FinalizationRegistry', async () => {
    expect(await importWithoutWeakRefs('../../2020/index')).toBe('loaded');
  });

  it('the emitted declaration keeps the es2021.weakref lib reference its source declares, so ES2020-lib consumers resolve WeakRef', () => {
    const ts = createRequire(__filename)('typescript') as typeof import('typescript');
    const parsed = ts.getParsedCommandLineOfConfigFile(
      join(packageDir, 'tsconfig.declarations.json'),
      {},
      { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
    );
    if (!parsed) throw new Error('tsconfig.declarations.json did not parse');
    const source = join(packageDir, 'src/validator/utils/registerSchemaRoot.ts');
    const program = ts.createProgram([source], {
      ...parsed.options,
      noEmit: false,
      declarationDir: join(packageDir, 'virtual-dist'),
    });
    let emitted = '';
    program.emit(undefined, (fileName, text) => {
      if (fileName.endsWith('registerSchemaRoot.d.ts')) emitted = text;
    }, undefined, true);
    expect(readSourceHead(source)).toContain('/// <reference lib="es2021.weakref" />');
    expect(emitted).toMatch(/WeakRef</);
    expect(emitted).toContain('reference lib="es2021.weakref"');
  });
});

/** The first line of a source file, where its lib reference directive sits. */
const readSourceHead = (file: string) =>
  createRequire(__filename)('node:fs').readFileSync(file, 'utf8').split('\n')[0];
