import { execFileSync } from 'node:child_process';

/**
 * Reads tracked paths without traversing dependency installations.
 * @param {string} root Git checkout directory.
 * @returns {string[]} Repository-relative tracked paths; git errors propagate.
 */
export function readTrackedFiles(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter(Boolean);
}
