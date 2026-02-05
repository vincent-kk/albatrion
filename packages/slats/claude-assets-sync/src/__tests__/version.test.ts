import { describe, expect, it } from 'vitest';

import { compareVersions, needsVersionSync } from '../utils/version';

describe('version.ts', () => {
  describe('compareVersions', () => {
    it('should return true for identical versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(true);
    });

    it('should return false for different major versions', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(false);
      expect(compareVersions('1.0.0', '2.0.0')).toBe(false);
    });

    it('should return false for different minor versions', () => {
      expect(compareVersions('1.1.0', '1.0.0')).toBe(false);
      expect(compareVersions('1.0.0', '1.1.0')).toBe(false);
    });

    it('should return false for different patch versions', () => {
      expect(compareVersions('1.0.1', '1.0.0')).toBe(false);
      expect(compareVersions('1.0.0', '1.0.1')).toBe(false);
    });

    it('should handle pre-release versions', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0-alpha')).toBe(true);
      expect(compareVersions('1.0.0-alpha', '1.0.0-beta')).toBe(false);
      expect(compareVersions('1.0.0-alpha', '1.0.0')).toBe(false);
    });

    it('should handle build metadata', () => {
      expect(compareVersions('1.0.0+build.1', '1.0.0+build.1')).toBe(true);
      expect(compareVersions('1.0.0+build.1', '1.0.0+build.2')).toBe(false);
      expect(compareVersions('1.0.0+build', '1.0.0')).toBe(false);
    });

    it('should handle multi-digit version numbers', () => {
      expect(compareVersions('10.20.30', '10.20.30')).toBe(true);
      expect(compareVersions('10.20.30', '10.20.31')).toBe(false);
    });

    it('should be case-sensitive for pre-release tags', () => {
      expect(compareVersions('1.0.0-Alpha', '1.0.0-alpha')).toBe(false);
      expect(compareVersions('1.0.0-BETA', '1.0.0-beta')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(compareVersions('', '')).toBe(true);
      expect(compareVersions('1.0.0', '')).toBe(false);
      expect(compareVersions('', '1.0.0')).toBe(false);
    });

    it('should handle version ranges (as strings)', () => {
      expect(compareVersions('^1.0.0', '^1.0.0')).toBe(true);
      expect(compareVersions('~1.0.0', '~1.0.0')).toBe(true);
      expect(compareVersions('^1.0.0', '~1.0.0')).toBe(false);
    });
  });

  describe('needsVersionSync', () => {
    it('should return false when versions match', () => {
      expect(needsVersionSync('1.0.0', '1.0.0')).toBe(false);
    });

    it('should return true when versions differ', () => {
      expect(needsVersionSync('1.0.1', '1.0.0')).toBe(true);
      expect(needsVersionSync('1.0.0', '1.0.1')).toBe(true);
    });

    it('should return true when synced version is undefined', () => {
      expect(needsVersionSync('1.0.0', undefined)).toBe(true);
    });

    it('should return true for major version changes', () => {
      expect(needsVersionSync('2.0.0', '1.0.0')).toBe(true);
      expect(needsVersionSync('1.0.0', '2.0.0')).toBe(true);
    });

    it('should return true for minor version changes', () => {
      expect(needsVersionSync('1.1.0', '1.0.0')).toBe(true);
      expect(needsVersionSync('1.0.0', '1.1.0')).toBe(true);
    });

    it('should return true for patch version changes', () => {
      expect(needsVersionSync('1.0.1', '1.0.0')).toBe(true);
      expect(needsVersionSync('1.0.0', '1.0.1')).toBe(true);
    });

    it('should return false when versions are identical strings', () => {
      expect(needsVersionSync('0.10.0', '0.10.0')).toBe(false);
      expect(needsVersionSync('1.2.3', '1.2.3')).toBe(false);
    });

    it('should handle pre-release versions', () => {
      expect(needsVersionSync('1.0.0-alpha', '1.0.0-alpha')).toBe(false);
      expect(needsVersionSync('1.0.0-alpha', '1.0.0-beta')).toBe(true);
      expect(needsVersionSync('1.0.0-alpha', '1.0.0')).toBe(true);
    });

    it('should handle build metadata', () => {
      expect(needsVersionSync('1.0.0+build.1', '1.0.0+build.1')).toBe(false);
      expect(needsVersionSync('1.0.0+build.1', '1.0.0+build.2')).toBe(true);
    });

    it('should treat undefined as "needs sync"', () => {
      expect(needsVersionSync('0.10.0', undefined)).toBe(true);
      expect(needsVersionSync('1.0.0', undefined)).toBe(true);
      expect(needsVersionSync('999.999.999', undefined)).toBe(true);
    });

    it('should handle empty string current version', () => {
      expect(needsVersionSync('', '1.0.0')).toBe(true);
      // Empty string is falsy, so treated as "no synced version" -> needs sync
      expect(needsVersionSync('', '')).toBe(true);
      expect(needsVersionSync('', undefined)).toBe(true);
    });

    it('should handle empty string synced version', () => {
      // Empty string is falsy, so treated as "no synced version" -> needs sync
      expect(needsVersionSync('1.0.0', '')).toBe(true);
      expect(needsVersionSync('', '')).toBe(true);
    });

    it('should return true for any version when synced is undefined', () => {
      const testVersions = [
        '0.0.1',
        '1.0.0',
        '10.20.30',
        '1.0.0-alpha',
        '1.0.0+build',
      ];

      for (const version of testVersions) {
        expect(needsVersionSync(version, undefined)).toBe(true);
      }
    });

    it('should return false only when versions exactly match', () => {
      const testCases: Array<[string, string, boolean]> = [
        ['1.0.0', '1.0.0', false],
        ['0.10.0', '0.10.0', false],
        ['1.0.0-alpha', '1.0.0-alpha', false],
        ['1.0.0', '1.0.1', true],
        ['2.0.0', '1.0.0', true],
      ];

      for (const [current, synced, expected] of testCases) {
        expect(needsVersionSync(current, synced)).toBe(expected);
      }
    });

    it('should handle complex version strings', () => {
      expect(needsVersionSync('1.0.0-alpha.1', '1.0.0-alpha.1')).toBe(false);
      expect(needsVersionSync('1.0.0-alpha.1', '1.0.0-alpha.2')).toBe(true);
      expect(
        needsVersionSync('1.0.0-rc.1+build.123', '1.0.0-rc.1+build.123'),
      ).toBe(false);
      expect(
        needsVersionSync('1.0.0-rc.1+build.123', '1.0.0-rc.1+build.456'),
      ).toBe(true);
    });

    it('should be consistent with compareVersions', () => {
      const testCases = [
        ['1.0.0', '1.0.0'],
        ['1.0.0', '1.0.1'],
        ['2.0.0', '1.0.0'],
        ['1.0.0-alpha', '1.0.0-beta'],
      ];

      for (const [v1, v2] of testCases) {
        const versionsMatch = compareVersions(v1, v2);
        const needsSync = needsVersionSync(v1, v2);

        // If versions match, should not need sync
        // If versions don't match, should need sync
        expect(needsSync).toBe(!versionsMatch);
      }
    });
  });

  describe('version sync scenarios', () => {
    it('should identify first-time sync (no previous version)', () => {
      expect(needsVersionSync('1.0.0', undefined)).toBe(true);
    });

    it('should identify upgrade scenario', () => {
      expect(needsVersionSync('1.0.1', '1.0.0')).toBe(true);
      expect(needsVersionSync('1.1.0', '1.0.0')).toBe(true);
      expect(needsVersionSync('2.0.0', '1.0.0')).toBe(true);
    });

    it('should identify downgrade scenario', () => {
      expect(needsVersionSync('1.0.0', '1.0.1')).toBe(true);
      expect(needsVersionSync('1.0.0', '1.1.0')).toBe(true);
      expect(needsVersionSync('1.0.0', '2.0.0')).toBe(true);
    });

    it('should identify up-to-date scenario', () => {
      expect(needsVersionSync('1.0.0', '1.0.0')).toBe(false);
      expect(needsVersionSync('0.10.0', '0.10.0')).toBe(false);
    });

    it('should handle pre-release to release transition', () => {
      expect(needsVersionSync('1.0.0', '1.0.0-rc.1')).toBe(true);
      expect(needsVersionSync('1.0.0-rc.1', '1.0.0')).toBe(true);
    });

    it('should handle build metadata changes', () => {
      expect(needsVersionSync('1.0.0+build.2', '1.0.0+build.1')).toBe(true);
      expect(needsVersionSync('1.0.0+20230101', '1.0.0+20230102')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle version with leading zeros', () => {
      expect(compareVersions('01.02.03', '01.02.03')).toBe(true);
      expect(needsVersionSync('01.02.03', '01.02.03')).toBe(false);
    });

    it('should handle very long version strings', () => {
      const longVersion =
        '1.0.0-alpha.beta.gamma.delta.epsilon+build.12345.67890';
      expect(compareVersions(longVersion, longVersion)).toBe(true);
      expect(needsVersionSync(longVersion, longVersion)).toBe(false);
    });

    it('should handle version strings with special characters', () => {
      const specialVersion = '1.0.0-rc.1+build.2023-01-01';
      expect(compareVersions(specialVersion, specialVersion)).toBe(true);
      expect(needsVersionSync(specialVersion, specialVersion)).toBe(false);
    });

    it('should handle whitespace differences', () => {
      expect(compareVersions('1.0.0', ' 1.0.0')).toBe(false);
      expect(compareVersions('1.0.0 ', '1.0.0')).toBe(false);
      expect(needsVersionSync('1.0.0', ' 1.0.0')).toBe(true);
    });
  });
});
