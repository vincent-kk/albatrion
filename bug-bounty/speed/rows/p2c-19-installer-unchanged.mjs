import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@slats/agents-assets-sync';

export default { pkg: '@slats/agents-assets-sync', fn: 'installer-unchanged', input: '16 skill files', inputKind: 'plain', kind: 'render', setup: () => {
  let root, argv, output; const stdout = process.stdout.write; const stderr = process.stderr.write; const capture = (chunk) => { output += String(chunk); return true; }; const quiet = async (args) => { process.stdout.write = capture; process.stderr.write = capture; try { await runCli(args); } finally { process.stdout.write = stdout; process.stderr.write = stderr; } };
  return { before: async () => {
    root = mkdtempSync(join(tmpdir(), 'p2-assets-')); const pkg = join(root, 'node_modules/@probe/p2'); mkdirSync(join(root, '.git'), { recursive: true }); mkdirSync(pkg, { recursive: true }); writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: '@probe/p2', version: '1.0.0', agents: { assetPath: 'agents' } }));
    for (let i = 0; i < 16; i++) { const dir = join(pkg, 'agents/skills', `p2-s${i}`); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'SKILL.md'), `---\nname: p2-s${i}\ndescription: Fixture p2-s${i}.\n---\n\n# Fixture p2-s${i}\n`); }
    
    argv = ['node', 'inject-agents-settings', '--package=@probe/p2', '--agent=claude', '--scope=project', '--asset-path=agents', `--root=${root}`, '--no-interactive']; output = '';
    await quiet(argv);
    
    output = ''; process.stdout.write = capture; process.stderr.write = capture;
  }, run: async () => { try { await runCli(argv); } finally { process.stdout.write = stdout; process.stderr.write = stderr; } }, check: () => Array.from({ length: 16 }, (_, i) => join(root, '.claude/skills', `p2-s${i}`, 'SKILL.md')).every(existsSync) && !output.includes('(deleting)'), after: () => rmSync(root, { recursive: true, force: true }) };
} };
