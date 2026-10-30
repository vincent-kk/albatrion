import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

/** Copy built bundles unchanged plus one export line into runDir; fail if an expected internal is absent. */
export function prepareEngines(
  packageDir,
  runDir,
  legacyVersion = '0.16.1',
  currentBundle = path.join(packageDir, 'dist/index.node.mjs'),
) {
  if (!['0.16.0', '0.16.1'].includes(legacyVersion))
    throw new Error('Unsupported legacy version');
  const require = createRequire(path.join(packageDir, 'package.json'));
  const legacyManifest = require.resolve(
    `@canard/schema-form_${legacyVersion}`,
  );
  const manifest = JSON.parse(
    fs.readFileSync(
      path.resolve(path.dirname(legacyManifest), '../package.json'),
      'utf8',
    ),
  );
  if (
    manifest.name !== '@canard/schema-form' ||
    manifest.version !== legacyVersion
  )
    throw new Error('Legacy alias identity mismatch');
  const jobs = {
    current: {
      source: path.resolve(currentBundle),
      names: [
        'blueprint',
        'fieldNodeFactory',
        'loadFieldNodeAtMount',
        'dispatchMount',
        'PathKeyedMap',
        'PathKeyedSet',
        'buildFieldNodeTree',
        'mountFieldNode',
      ],
    },
    legacy: {
      source: path.join(path.dirname(legacyManifest), 'index.mjs'),
      names: ['nodeFromJSONSchema'],
    },
  };
  fs.mkdirSync(path.join(runDir, 'engines'), { recursive: true });
  for (const [engine, job] of Object.entries(jobs)) {
    const bytes = fs.readFileSync(job.source);
    const source = bytes.toString('utf8');
    const names = job.names.filter(
      (name) =>
        !new RegExp(`\\b${name}\\s*(?:,|\\s|})`).test(
          source.slice(source.lastIndexOf('export {')),
        ),
    );
    for (const name of job.names) {
      if (
        !new RegExp(
          `^(?:const|let|var|function|class) ${name}(?:[ (=;])`,
          'm',
        ).test(source)
      )
        throw new Error(`Missing ${name} in ${job.source}`);
    }
    const exports =
      engine === 'legacy'
        ? 'nodeFromJSONSchema as legacyNodeFromJSONSchema'
        : names.join(', ');
    const destination = path.join(runDir, 'engines', `${engine}.mjs`);
    fs.writeFileSync(destination, `${source}\nexport { ${exports} };\n`);
    job.sha256 = createHash('sha256').update(bytes).digest('hex');
    job.destination = destination;
  }
  const record = { packageDir, legacyVersion, engines: jobs };
  fs.writeFileSync(
    path.join(runDir, 'engines.json'),
    `${JSON.stringify(record, null, 2)}\n`,
  );
  return record;
}
