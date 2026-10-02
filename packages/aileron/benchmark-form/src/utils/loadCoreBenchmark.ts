import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Exposes the existing core factory from each installed bundle without rewriting its implementation. */
export async function loadCoreBenchmark(version: string) {
  if (version === 'latest') {
    const destination = path.resolve('results/.core/workspace.mjs');
    await build({
      entryPoints: [
        fileURLToPath(
          new URL(
            '../../../../canard/schema-form/src/core/index.ts',
            import.meta.url,
          ),
        ),
      ],
      outfile: destination,
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'esm',
    });
    const source = fs.readFileSync(destination, 'utf8');
    const { nodeFromJSONSchema } = await import(
      pathToFileURL(destination).href
    );
    return {
      create: nodeFromJSONSchema,
      digest: createHash('sha256').update(source).digest('hex'),
    };
  }
  const name =
    version === 'latest' ? '@canard/schema-form' : '@canard/schema-form_0.16.0';
  const bundlePath = fileURLToPath(import.meta.resolve(name));
  const source = fs.readFileSync(bundlePath, 'utf8');
  if (
    !/(?:function nodeFromJSONSchema\(|const nodeFromJSONSchema =)/.test(source)
  )
    throw new Error(`Core factory unavailable in ${name}`);
  const digest = createHash('sha256').update(source).digest('hex');
  const directory = path.resolve('results/.core');
  fs.mkdirSync(directory, { recursive: true });
  const destination = path.join(directory, `${version}-${digest}.mjs`);
  fs.writeFileSync(
    destination,
    `${source}\nexport { nodeFromJSONSchema as benchmarkCore };\n`,
  );
  const { benchmarkCore } = await import(pathToFileURL(destination).href);
  return { create: benchmarkCore, digest };
}
