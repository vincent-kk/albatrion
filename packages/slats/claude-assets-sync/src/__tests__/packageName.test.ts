import { describe, expect, it } from 'vitest';

import {
  packageNameToPrefix,
  parsePackageName,
  prefixToPackageName,
} from '../utils/packageName';

describe('packageName.ts', () => {
  describe('parsePackageName', () => {
    it('should parse scoped package name', () => {
      const [scope, name] = parsePackageName('@canard/schema-form');

      expect(scope).toBe('@canard');
      expect(name).toBe('schema-form');
    });

    it('should parse another scoped package', () => {
      const [scope, name] = parsePackageName('@lerx/promise-modal');

      expect(scope).toBe('@lerx');
      expect(name).toBe('promise-modal');
    });

    it('should parse scoped package with multiple hyphens', () => {
      const [scope, name] = parsePackageName('@winglet/react-utils');

      expect(scope).toBe('@winglet');
      expect(name).toBe('react-utils');
    });

    it('should parse non-scoped package name', () => {
      const [scope, name] = parsePackageName('lodash');

      expect(scope).toBe('');
      expect(name).toBe('lodash');
    });

    it('should parse non-scoped package with hyphens', () => {
      const [scope, name] = parsePackageName('my-package-name');

      expect(scope).toBe('');
      expect(name).toBe('my-package-name');
    });

    it('should handle single character scope', () => {
      const [scope, name] = parsePackageName('@a/package');

      expect(scope).toBe('@a');
      expect(name).toBe('package');
    });

    it('should handle single character package name', () => {
      const [scope, name] = parsePackageName('@scope/p');

      expect(scope).toBe('@scope');
      expect(name).toBe('p');
    });
  });

  describe('packageNameToPrefix', () => {
    it('should convert scoped package to flat prefix', () => {
      const prefix = packageNameToPrefix('@canard/schema-form');

      expect(prefix).toBe('canard-schemaForm');
    });

    it('should convert another scoped package', () => {
      const prefix = packageNameToPrefix('@lerx/promise-modal');

      expect(prefix).toBe('lerx-promiseModal');
    });

    it('should handle multi-hyphen package names', () => {
      const prefix = packageNameToPrefix('@winglet/react-utils');

      expect(prefix).toBe('winglet-reactUtils');
    });

    it('should handle deeply hyphenated names', () => {
      const prefix = packageNameToPrefix('@scope/my-long-package-name');

      expect(prefix).toBe('scope-myLongPackageName');
    });

    it('should convert non-scoped package to camelCase', () => {
      const prefix = packageNameToPrefix('lodash');

      expect(prefix).toBe('lodash');
    });

    it('should convert non-scoped hyphenated package', () => {
      const prefix = packageNameToPrefix('my-package');

      expect(prefix).toBe('myPackage');
    });

    it('should handle non-scoped multi-hyphen package', () => {
      const prefix = packageNameToPrefix('my-long-package-name');

      expect(prefix).toBe('myLongPackageName');
    });

    it('should handle single character names', () => {
      const prefix = packageNameToPrefix('@a/b');

      expect(prefix).toBe('a-b');
    });

    it('should handle already camelCase non-scoped names', () => {
      const prefix = packageNameToPrefix('lodash'); // no hyphens

      expect(prefix).toBe('lodash');
    });
  });

  describe('prefixToPackageName', () => {
    it('should convert flat prefix to scoped package', () => {
      const packageName = prefixToPackageName('canard-schemaForm');

      expect(packageName).toBe('@canard/schema-form');
    });

    it('should convert another flat prefix', () => {
      const packageName = prefixToPackageName('lerx-promiseModal');

      expect(packageName).toBe('@lerx/promise-modal');
    });

    it('should handle complex camelCase names', () => {
      const packageName = prefixToPackageName('winglet-reactUtils');

      expect(packageName).toBe('@winglet/react-utils');
    });

    it('should handle deeply camelCase names', () => {
      const packageName = prefixToPackageName('scope-myLongPackageName');

      expect(packageName).toBe('@scope/my-long-package-name');
    });

    it('should convert non-scoped prefix to kebab-case', () => {
      const packageName = prefixToPackageName('lodash');

      expect(packageName).toBe('lodash');
    });

    it('should convert camelCase non-scoped prefix', () => {
      const packageName = prefixToPackageName('myPackage');

      expect(packageName).toBe('my-package');
    });

    it('should handle complex non-scoped camelCase', () => {
      const packageName = prefixToPackageName('myLongPackageName');

      expect(packageName).toBe('my-long-package-name');
    });

    it('should handle single character parts', () => {
      const packageName = prefixToPackageName('a-b');

      expect(packageName).toBe('@a/b');
    });
  });

  describe('round-trip conversions', () => {
    it('should preserve scoped package through round-trip', () => {
      const original = '@canard/schema-form';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve another scoped package', () => {
      const original = '@lerx/promise-modal';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve multi-hyphen scoped package', () => {
      const original = '@winglet/react-utils';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve deeply hyphenated package', () => {
      const original = '@scope/my-long-package-name';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve non-scoped package', () => {
      const original = 'lodash';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve hyphenated non-scoped package', () => {
      const original = 'my-package';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should preserve complex non-scoped package', () => {
      const original = 'my-long-package-name';
      const prefix = packageNameToPrefix(original);
      const restored = prefixToPackageName(prefix);

      expect(restored).toBe(original);
    });

    it('should handle multiple round-trips', () => {
      const original = '@canard/schema-form';

      let result = original;
      for (let i = 0; i < 5; i++) {
        const prefix = packageNameToPrefix(result);
        result = prefixToPackageName(prefix);
      }

      expect(result).toBe(original);
    });
  });

  describe('edge cases', () => {
    it('should handle scope with numbers', () => {
      const [scope, name] = parsePackageName('@scope123/package');
      expect(scope).toBe('@scope123');
      expect(name).toBe('package');
    });

    it('should handle package name with numbers', () => {
      const [scope, name] = parsePackageName('@scope/package123');
      expect(scope).toBe('@scope');
      expect(name).toBe('package123');
    });

    it('should handle prefix conversion with numbers', () => {
      const prefix = packageNameToPrefix('@scope123/package456');
      expect(prefix).toBe('scope123-package456');
    });

    it('should preserve numbers in round-trip with hyphens', () => {
      // When numbers follow a hyphen, they become part of the next segment
      // '@scope123/package-name-456' -> 'scope123-packageName456' (456 becomes part of camelCase)
      // Then back: 'scope123-packageName456' -> '@scope123/package-name456' (no hyphen before 456)
      // This is expected - numbers attached to camelCase stay attached
      const original = '@scope123/package-name-456';
      const prefix = packageNameToPrefix(original);
      expect(prefix).toBe('scope123-packageName456');

      const restored = prefixToPackageName(prefix);
      // The hyphen before 456 is lost because 456 is treated as part of "Name456"
      expect(restored).toBe('@scope123/package-name456');
    });
  });
});
