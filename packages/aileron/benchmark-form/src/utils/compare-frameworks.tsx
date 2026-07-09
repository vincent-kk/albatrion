import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { BenchResult } from '../benchmarks/competitors/harness';
import { setupJsdom } from './setup-env';

// Measure against the PRODUCTION React build — the deploy reality. react-dom's
// dev build spends ~half of mount on validateProperty / warnUnknownProperties /
// logComponentRender / runWithFiberInDEV, which no user ships (dev ~79ms vs
// prod ~36ms per 500-field mount here). This must run BEFORE the adapters — and
// thus react-dom — are dynamically imported inside main(), so react-dom/client
// resolves to react-dom-client.production.js. Pass NODE_ENV=development to
// deliberately profile the dev paths instead.
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

// JSDOM must exist before any form library module evaluates.
setupJsdom();

const SIZES = [50, 100, 500];

function pad(value: string, width: number): string {
  return value.padStart(width);
}

function flag(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : undefined;
}

function row(r: BenchResult): string {
  const mount = `${pad(r.mountMs.toFixed(1), 6)} /${pad(String(r.mountRenders), 4)}`;
  const key = `${pad(r.keystrokeMs.toFixed(3), 6)} /${pad(r.keystrokeRenders.toFixed(1), 6)}`;
  const set = `${pad(r.setValueMs.toFixed(3), 6)} /${pad(r.setValueRenders.toFixed(1), 6)}`;
  return `  ${r.name.padEnd(22)}  ${mount}  ${key}  ${set}`;
}

async function main(): Promise<void> {
  const { benchAdapter } = await import('../benchmarks/competitors/harness');
  const { canardAdapter } = await import('../benchmarks/competitors/canard');
  const { rjsfAdapter } = await import('../benchmarks/competitors/rjsf');
  const { rhfAdapter } = await import('../benchmarks/competitors/rhf');
  const { formikAdapter } = await import('../benchmarks/competitors/formik');
  const { tanstackAdapter } = await import(
    '../benchmarks/competitors/tanstack'
  );

  const adapters = [
    canardAdapter,
    rjsfAdapter,
    rhfAdapter,
    formikAdapter,
    tanstackAdapter,
  ];
  const all: BenchResult[] = [];

  for (const size of SIZES) {
    console.log(`\n=== ${size} flat string fields ===`);
    console.log(
      `  ${'library'.padEnd(22)}  ${'mount'.padStart(13)}  ${'keystroke'.padStart(15)}  ${'setValue'.padStart(15)}`,
    );
    console.log(
      `  ${''.padEnd(22)}  ${'(ms / renders)'.padStart(13)}  ${'(ms / renders)'.padStart(15)}  ${'(ms / renders)'.padStart(15)}`,
    );
    for (const adapter of adapters) {
      try {
        const r = await benchAdapter(adapter, size);
        all.push(r);
        console.log(row(r));
      } catch (error) {
        console.log(
          `  ${adapter.name.padEnd(22)}  ERROR: ${(error as Error).message}`,
        );
      }
    }
  }

  // Persist results for history / CI artifacts.
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = resolve(
    process.cwd(),
    flag('out') ?? `results/compare-${timestamp}.json`,
  );
  writeFileSync(
    outPath,
    JSON.stringify({ timestamp, sizes: SIZES, results: all }, null, 2),
  );
  console.log(`\n💾 saved: ${outPath}`);

  // Regression guard for schema-form's fine-grained edge: a single field
  // change must re-render ONLY that field (siblings stay at 0). A keystroke or
  // setValue fan-out above 1 means the memo boundary regressed — the very
  // property that puts schema-form ahead of rjsf/Formik on interaction.
  if (process.argv.includes('--assert')) {
    const canard = all.filter((r) => r.name === '@canard/schema-form');
    const broken = canard.filter(
      (r) => r.keystrokeRenders > 1.01 || r.setValueRenders > 1.01,
    );
    if (broken.length > 0) {
      console.error(
        '\n❌ react-render regression — schema-form re-rendered sibling fields:',
      );
      for (const b of broken)
        console.error(
          `   ${b.fieldCount} fields: keystroke ${b.keystrokeRenders.toFixed(1)}r, setValue ${b.setValueRenders.toFixed(1)}r (expected <= 1.0)`,
        );
      process.exit(1);
    }
    console.log(
      '\n✓ assert: schema-form keeps sibling re-renders at 0 across all sizes (fine-grained intact)',
    );
  }

  console.log('\n done.');
}

main();
