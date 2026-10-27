// Invoked by Node CLI after quiet-window authorization; all raw output stays under one external root.
process.env.NODE_ENV = 'production';
const fs = await import('node:fs');
const path = await import('node:path');
const { fileURLToPath } = await import('node:url');
const { spawn } = await import('node:child_process');
const { sampleWindow } = await import('./sampleWindow.mjs');
const { buildBundle } = await import('./buildBundle.mjs');
const runDir = process.argv[2];
if (
  !/^\/private\/tmp\/claude-501\/perf-runs\/\d{8}T\d{4}-b8db539-b0$/.test(
    runDir,
  )
)
  throw new Error('Use the documented external B0 root');
fs.mkdirSync(runDir, { recursive: false });
const stagesDir = path.join(runDir, 'stages');
fs.mkdirSync(stagesDir);
await buildBundle(
  fileURLToPath(new URL('../../../../../../', import.meta.url)),
  stagesDir,
);
const window = await sampleWindow();
fs.writeFileSync(
  path.join(runDir, 'quiet-window.json'),
  JSON.stringify(window, null, 2),
);
if (window.heavy.length)
  throw new Error(
    `B0_QUIET_BLOCKED ${JSON.stringify(window.heavy)}; no formal samples taken`,
  );
console.log(`B0_QUIET_OK ${window.quietSince}`);
for (const [label, url] of [
  ['pair', new URL('../../branch-switch.mjs', import.meta.url)],
  ['stages', new URL('../branch-switch-ledger.mjs', import.meta.url)],
]) {
  const log = fs.openSync(path.join(runDir, `${label}.log`), 'w');
  const args = [
    fileURLToPath(url),
    '--samples=100',
    '--warmups=20',
    '--runs=3',
    `--quiet-since=${window.quietSince}`,
    `--run-dir=${path.join(runDir, label)}`,
  ];
  if (label === 'stages') args.push('--prepared=true');
  fs.writeFileSync(
    path.join(runDir, `${label}.command.json`),
    JSON.stringify({ executable: process.execPath, args }, null, 2),
  );
  const child = spawn(process.execPath, args, {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', log, log],
  });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  fs.closeSync(log);
  if (code !== 0)
    throw new Error(
      `${label} failed (${code}); preserve this window and do not remeasure`,
    );
  console.log(`B0_WINDOW_${label.toUpperCase()}_OK`);
}
fs.writeFileSync(
  path.join(runDir, 'window-end.json'),
  JSON.stringify(
    { endedAt: new Date().toISOString(), processes: await sampleWindow() },
    null,
    2,
  ),
);
console.log(`B0_WINDOW_OK ${runDir}`);
