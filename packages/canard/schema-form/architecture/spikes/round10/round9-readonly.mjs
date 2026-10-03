/** Preloaded into the original round9 harness and its children; redirect generated writes only. */
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve, relative, dirname } from 'node:path';
const source = fileURLToPath(new URL('../round9/', import.meta.url));
const output = fileURLToPath(new URL('./round9-run/', import.meta.url));
const allowed = fileURLToPath(new URL('./', import.meta.url));
const read = fs.readFileSync.bind(fs);
const write = fs.writeFileSync.bind(fs);
const mkdir = fs.mkdirSync.bind(fs);
const exists = fs.existsSync.bind(fs);
const localPath = value => value instanceof URL ? fileURLToPath(value) : typeof value === 'string' ? resolve(value) : null;
const within = (base, path) => path === base.slice(0, -1) || path.startsWith(base);
fs.writeFileSync = (path, data, options) => {
  const absolute = localPath(path);
  if (!absolute) throw new Error('Unexpected file-descriptor write');
  if (within(source, absolute)) {
    const mapped = resolve(output, relative(source, absolute));
    mkdir(dirname(mapped), { recursive: true });
    return write(mapped, data, options);
  }
  if (!within(allowed, absolute)) throw new Error('Write outside round10 blocked: ' + absolute);
  return write(absolute, data, options);
};
fs.readFileSync = (path, options) => {
  const absolute = localPath(path);
  if (absolute && within(source, absolute)) {
    const mapped = resolve(output, relative(source, absolute));
    if (exists(mapped)) return read(mapped, options);
  }
  return read(path, options);
};
syncBuiltinESMExports();
