import { describe, expect, it } from 'vitest';

import { createProgram } from '../cli';

describe('CLI', () => {
  describe('createProgram', () => {
    it('should create a commander program', () => {
      const program = createProgram();

      expect(program.name()).toBe('claude-assets-sync');
      expect(program.version()).toBe('0.1.0');
    });

    it('should have -p/--package option', () => {
      const program = createProgram();
      const option = program.options.find(
        (opt) => opt.short === '-p' || opt.long === '--package',
      );

      expect(option).toBeDefined();
      expect(option?.description).toContain('Package name');
    });

    it('should have -f/--force option', () => {
      const program = createProgram();
      const option = program.options.find(
        (opt) => opt.short === '-f' || opt.long === '--force',
      );

      expect(option).toBeDefined();
    });

    it('should have --dry-run option', () => {
      const program = createProgram();
      const option = program.options.find((opt) => opt.long === '--dry-run');

      expect(option).toBeDefined();
    });

    it('should parse single package option', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(['node', 'test', '-p', '@canard/schema-form'], {
        from: 'user',
      });

      const opts = program.opts();
      expect(opts.package).toEqual(['@canard/schema-form']);
    });

    it('should parse multiple package options', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(
        [
          'node',
          'test',
          '-p',
          '@canard/schema-form',
          '-p',
          '@lerx/promise-modal',
        ],
        { from: 'user' },
      );

      const opts = program.opts();
      expect(opts.package).toEqual([
        '@canard/schema-form',
        '@lerx/promise-modal',
      ]);
    });

    it('should parse force option', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(['node', 'test', '-p', '@pkg/name', '--force'], {
        from: 'user',
      });

      const opts = program.opts();
      expect(opts.force).toBe(true);
    });

    it('should parse dry-run option', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(['node', 'test', '-p', '@pkg/name', '--dry-run'], {
        from: 'user',
      });

      const opts = program.opts();
      expect(opts.dryRun).toBe(true);
    });

    it('should combine multiple options', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(
        ['node', 'test', '-p', '@pkg/one', '-p', '@pkg/two', '-f', '--dry-run'],
        { from: 'user' },
      );

      const opts = program.opts();
      expect(opts.package).toEqual(['@pkg/one', '@pkg/two']);
      expect(opts.force).toBe(true);
      expect(opts.dryRun).toBe(true);
    });

    it('should default force to false', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(['node', 'test', '-p', '@pkg/name'], { from: 'user' });

      const opts = program.opts();
      expect(opts.force).toBe(false);
    });

    it('should default dryRun to false', () => {
      const program = createProgram();
      program.exitOverride();

      program.parse(['node', 'test', '-p', '@pkg/name'], { from: 'user' });

      const opts = program.opts();
      expect(opts.dryRun).toBe(false);
    });
  });
});
