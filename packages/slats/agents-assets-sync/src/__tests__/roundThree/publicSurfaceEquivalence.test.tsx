import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { afterEach, expect, it, vi } from 'vitest';
import { runCli } from '../../index.js';
import { installPackage, makeRoot, removeRoot, writeAt } from './fixture.js';

const fault = vi.hoisted(() => ({ write: false }));
vi.mock('node:fs/promises', async (load) => {
  const actual = await load<typeof import('node:fs/promises')>();
  return { ...actual, writeFile: async (...args: Parameters<typeof actual.writeFile>) => {
    if (fault.write && typeof args[0] === 'string' && /(?:AGENTS\.md|\/document)$/.test(args[0])) {
      await actual.writeFile(args[0], Buffer.from('partial write'), args[2]);
      throw new Error('injected interrupted write');
    }
    return actual.writeFile(...args);
  } };
});
const streams = vi.hoisted(() => ({
  __r3Stdin: { write: (_data: string) => {} },
  __r3Stdout: { lastFrame: (): string => '' },
}));

vi.mock('ink', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ink')>();
  const { WriteStream } = await import('node:tty');
  const { Socket } = await import('node:net');
  class Stdout extends WriteStream {
    constructor() {
      super(1);
    }
    frames: string[] = [];
    columns = 100;
    write = (
      frame: string | Uint8Array,
      encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void,
    ) => {
      if (String(frame)) this.frames.push(String(frame));
      if (typeof encodingOrCallback === 'function') encodingOrCallback();
      else callback?.();
      return true;
    };
    lastFrame = () => this.frames.filter((frame) => stripVTControlCharacters(frame).trim()).at(-1) ?? '';
  }
  class Stdin extends Socket {
    isRaw = false;
    isTTY = true;
    data: string | null = null;
    write = (data: string | Uint8Array) => {
      this.data = String(data);
      this.emit('readable');
      this.emit('data', data);
      return true;
    };
    setEncoding() {
      return this;
    }
    setRawMode(mode: boolean) {
      this.isRaw = mode;
      return this;
    }
    resume() {
      return this;
    }
    pause() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    read = () => {
      const { data } = this;
      this.data = null;
      return data;
    };
  }
  return {
    ...actual,
    render: (tree: Parameters<typeof actual.render>[0], options?: object) => {
      const stdout = new Stdout();
      const stdin = new Stdin();
      streams.__r3Stdout = stdout;
      streams.__r3Stdin = stdin;
      return actual.render(tree, {
        ...options,
        stdout: stdout,
        stderr: new Stdout(),
        stdin: stdin,
        debug: true,
        patchConsole: false,
      });
    },
  };
});


const roots: string[] = [];
afterEach(() => { roots.splice(0).forEach(removeRoot); vi.restoreAllMocks(); fault.write = false; });
class Exit extends Error { constructor(readonly code: number) { super('exit'); } }
async function execute(surface: string, scenario: string) {
  const root = makeRoot('public-surface'); roots.push(root);
  const name = '@probe/good';
  installPackage(root, { name, assets: { 'skills/good/SKILL.md': '# source', 'rules/r.md': '# rule' } });
  if (scenario === 'scope') writeAt(join(root, 'node_modules/@probe/partial/package.json'), '{');
  const original = Buffer.from('Keep the handwritten document.\n'.repeat(100));
  if (scenario === 'write') writeAt(join(root, 'AGENTS.md'), original);
  if (scenario === 'force') writeAt(join(root, '.claude/skills/good/SKILL.md'), '# user edit');
  let stdout = '', diagnostics = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => { stdout += String(chunk); return true; });
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => { diagnostics += String(chunk); return true; });
  const codes: number[] = [];
  vi.spyOn(process, 'exit').mockImplementation((code) => { codes.push(Number(code ?? 0)); throw new Exit(Number(code ?? 0)); });
  const outTTY = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
  const inTTY = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
  Object.defineProperty(process.stdout, 'isTTY', { value: surface === 'ink', configurable: true });
  Object.defineProperty(process.stdin, 'isTTY', { value: surface === 'ink', configurable: true });
  const target = scenario === 'scope' ? '@probe' : scenario === 'unknown' ? '@probe/missing' : name;
  fault.write = scenario === 'write';
  try {
    await runCli(['node', 'inject-agents-settings', `--package=${target}`,
      `--agent=${scenario === 'write' ? 'codex' : 'claude'}`, '--scope=project', `--root=${root}`,
      ...(scenario === 'force' ? ['--force', '--yes'] : []),
      ...(surface === 'json' ? ['--json'] : surface === 'plain' ? ['--no-interactive'] : []),
    ]);
  } catch (error) { if (!(error instanceof Exit)) throw error; }
  finally {
    if (outTTY) Object.defineProperty(process.stdout, 'isTTY', outTTY); else Reflect.deleteProperty(process.stdout, 'isTTY');
    if (inTTY) Object.defineProperty(process.stdin, 'isTTY', inTTY); else Reflect.deleteProperty(process.stdin, 'isTTY');
    vi.restoreAllMocks(); fault.write = false;
  }
  const frame = stripVTControlCharacters(surface === 'ink' ? streams.__r3Stdout.lastFrame() : '');
  const transcript = stripVTControlCharacters(stdout + diagnostics + frame);
  const parsed = surface === 'json' && stdout.trim().startsWith('{') ? JSON.parse(stdout) : undefined;
  const units: string[] = parsed ? parsed.units.map((unit: { package: { name: string } }) => unit.package.name)
    : [...transcript.matchAll(/▸\s+(@probe\/[\w-]+)/g)].map((match) => match[1]);
  return { code: codes[0] ?? 0, units: [...new Set(units)].sort(),
    skippedReason: scenario === 'scope' ? transcript.includes('@probe/partial/package.json') : false,
    originalKept: scenario === 'write' ? readFileSync(join(root, 'AGENTS.md')).equals(original) : true,
    updated: scenario === 'force' ? (parsed ? parsed.units[0].report.updated.length === 1
      : surface === 'ink' ? /updated\s+1/.test(frame) : /~ skills\/good\/SKILL\.md/.test(transcript)) : false,
  };
}
it.each(['unknown', 'scope', 'write', 'force'])('public CLI reports %s equivalently on all surfaces', async (scenario) => {
  const plain = await execute('plain', scenario);
  expect(plain.code).toBe(scenario === 'unknown' ? 2 : scenario === 'write' ? 1 : 0);
  if (scenario === 'write') expect(plain.originalKept).toBe(true);
  if (scenario === 'scope') expect(plain.skippedReason).toBe(true);
  if (scenario === 'force') expect(plain.updated).toBe(true);
  expect(await execute('json', scenario)).toEqual(plain);
  expect(await execute('ink', scenario)).toEqual(plain);
});
