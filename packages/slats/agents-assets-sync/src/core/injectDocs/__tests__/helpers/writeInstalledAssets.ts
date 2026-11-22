// Loaded by the concurrent record test in its own Node process.
import { openInstalledAssets } from '../../utils/session/utils/openInstalledAssets.js';

const [, , path, owner, hash] = process.argv;
const installed = await openInstalledAssets(path);
process.once('message', async () => {
  await installed.record(owner, [
    {
      kind: 'copy',
      relPath: 'rules/installed.md',
      target: { kind: 'file', dstAbs: path },
      sourceHash: hash,
    },
  ]);
  process.disconnect?.();
});
process.send?.('ready');
