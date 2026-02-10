import { describe, expect, it } from 'vitest';

import {
  kebabToCamel,
  parseFlatFileName,
  toFlatFileName,
} from '../utils/nameTransform';
import { packageNameToPrefix } from '../utils/packageName';

describe('kebabToCamel', () => {
  it('converts simple kebab-case to camelCase', () => {
    expect(kebabToCamel('schema-form')).toBe('schemaForm');
    expect(kebabToCamel('react-utils')).toBe('reactUtils');
    expect(kebabToCamel('promise-modal')).toBe('promiseModal');
  });

  it('converts multi-hyphen kebab-case to camelCase', () => {
    expect(kebabToCamel('schema-form-plugin')).toBe('schemaFormPlugin');
    expect(kebabToCamel('my-long-name')).toBe('myLongName');
    expect(kebabToCamel('a-b-c-d')).toBe('aBCD');
  });

  it('handles strings without hyphens', () => {
    expect(kebabToCamel('lodash')).toBe('lodash');
    expect(kebabToCamel('simple')).toBe('simple');
    expect(kebabToCamel('package')).toBe('package');
  });

  it('handles empty string', () => {
    expect(kebabToCamel('')).toBe('');
  });

  it('handles single character segments', () => {
    expect(kebabToCamel('a-b')).toBe('aB');
    expect(kebabToCamel('x-y-z')).toBe('xYZ');
  });

  it('preserves existing capital letters at segment start', () => {
    // kebabToCamel only capitalizes after hyphens
    expect(kebabToCamel('React-Component')).toBe('ReactComponent');
  });
});

describe('packageNameToPrefix', () => {
  describe('scoped packages', () => {
    it('converts @canard packages', () => {
      expect(packageNameToPrefix('@canard/schema-form')).toBe(
        'canard-schemaForm',
      );
      expect(packageNameToPrefix('@canard/schema-form-plugin')).toBe(
        'canard-schemaFormPlugin',
      );
    });

    it('converts @scope/package-name pattern', () => {
      expect(packageNameToPrefix('@scope/package-name')).toBe(
        'scope-packageName',
      );
      expect(packageNameToPrefix('@winglet/react-utils')).toBe(
        'winglet-reactUtils',
      );
      expect(packageNameToPrefix('@lerx/promise-modal')).toBe(
        'lerx-promiseModal',
      );
    });

    it('handles multi-hyphen package names', () => {
      expect(packageNameToPrefix('@a/b-c-d')).toBe('a-bCD');
      expect(packageNameToPrefix('@scope/package-name-plugin')).toBe(
        'scope-packageNamePlugin',
      );
      expect(packageNameToPrefix('@org/my-long-package-name')).toBe(
        'org-myLongPackageName',
      );
    });

    it('handles scope and package without hyphens', () => {
      expect(packageNameToPrefix('@scope/package')).toBe('scope-package');
      expect(packageNameToPrefix('@org/lib')).toBe('org-lib');
    });
  });

  describe('non-scoped packages', () => {
    it('converts simple package names to camelCase', () => {
      expect(packageNameToPrefix('simple-package')).toBe('simplePackage');
      expect(packageNameToPrefix('lodash')).toBe('lodash');
      expect(packageNameToPrefix('react-dom')).toBe('reactDom');
    });

    it('handles multi-hyphen non-scoped packages', () => {
      expect(packageNameToPrefix('my-long-package-name')).toBe(
        'myLongPackageName',
      );
      expect(packageNameToPrefix('a-b-c-d')).toBe('aBCD');
    });
  });

  describe('edge cases', () => {
    it('handles single-character scope and package', () => {
      expect(packageNameToPrefix('@a/b')).toBe('a-b');
      expect(packageNameToPrefix('@x/y-z')).toBe('x-yZ');
    });

    it('handles empty package name parts', () => {
      // These are technically invalid package names, but testing behavior
      expect(packageNameToPrefix('@scope/')).toBe('scope-');
      expect(packageNameToPrefix('@/package')).toBe('-package');
    });
  });
});

describe('toFlatFileName', () => {
  it('creates flat file names with underscore separator for single files', () => {
    expect(toFlatFileName('canard-schemaForm', 'guide.md')).toBe(
      'canard-schemaForm_guide.md',
    );
    expect(toFlatFileName('winglet-reactUtils', 'README.md')).toBe(
      'winglet-reactUtils_README.md',
    );
    expect(toFlatFileName('lerx-promiseModal', 'types.ts')).toBe(
      'lerx-promiseModal_types.ts',
    );
  });

  it('preserves directory structure for directory-based entries', () => {
    expect(toFlatFileName('canard-schemaForm', 'expert/SKILL.md')).toBe(
      'canard-schemaForm_expert/SKILL.md',
    );
    expect(toFlatFileName('winglet-reactUtils', 'docs/guide.md')).toBe(
      'winglet-reactUtils_docs/guide.md',
    );
    expect(toFlatFileName('lerx-promiseModal', 'src/utils/helper.ts')).toBe(
      'lerx-promiseModal_src/utils/helper.ts',
    );
  });

  it('applies prefix only to top-level directory', () => {
    expect(toFlatFileName('canard-schemaForm', 'expert/knowledge/api.md')).toBe(
      'canard-schemaForm_expert/knowledge/api.md',
    );
    expect(toFlatFileName('winglet-reactUtils', 'docs/api/guide.md')).toBe(
      'winglet-reactUtils_docs/api/guide.md',
    );
  });

  it('handles files without extension', () => {
    expect(toFlatFileName('canard-schemaForm', 'README')).toBe(
      'canard-schemaForm_README',
    );
    expect(toFlatFileName('winglet-reactUtils', 'LICENSE')).toBe(
      'winglet-reactUtils_LICENSE',
    );
  });

  it('handles multiple dots in filename', () => {
    expect(toFlatFileName('canard-schemaForm', 'config.test.ts')).toBe(
      'canard-schemaForm_config.test.ts',
    );
    expect(toFlatFileName('winglet-reactUtils', 'types.d.ts')).toBe(
      'winglet-reactUtils_types.d.ts',
    );
  });

  it('handles deeply nested paths', () => {
    expect(toFlatFileName('canard-schemaForm', 'a/b/c/d/e/file.md')).toBe(
      'canard-schemaForm_a/b/c/d/e/file.md',
    );
  });
});

describe('parseFlatFileName', () => {
  describe('valid flat file names', () => {
    it('parses simple flat file names', () => {
      expect(parseFlatFileName('canard-schemaForm_guide.md')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'guide.md',
      });
      expect(parseFlatFileName('winglet-reactUtils_README.md')).toEqual({
        prefix: 'winglet-reactUtils',
        original: 'README.md',
      });
    });

    it('parses flat file names with preserved directory structure', () => {
      expect(parseFlatFileName('canard-schemaForm_expert/SKILL.md')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'expert/SKILL.md',
      });
      expect(parseFlatFileName('winglet-reactUtils_docs/guide.md')).toEqual({
        prefix: 'winglet-reactUtils',
        original: 'docs/guide.md',
      });
      expect(
        parseFlatFileName('lerx-promiseModal_src/utils/helper.ts'),
      ).toEqual({
        prefix: 'lerx-promiseModal',
        original: 'src/utils/helper.ts',
      });
    });

    it('parses deeply nested paths', () => {
      expect(parseFlatFileName('canard-schemaForm_a/b/c/d/e/file.md')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'a/b/c/d/e/file.md',
      });
    });

    it('parses files without extension', () => {
      expect(parseFlatFileName('canard-schemaForm_README')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'README',
      });
      expect(parseFlatFileName('winglet-reactUtils_LICENSE')).toEqual({
        prefix: 'winglet-reactUtils',
        original: 'LICENSE',
      });
    });

    it('parses files with multiple dots', () => {
      expect(parseFlatFileName('canard-schemaForm_config.test.ts')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'config.test.ts',
      });
      expect(parseFlatFileName('winglet-reactUtils_types.d.ts')).toEqual({
        prefix: 'winglet-reactUtils',
        original: 'types.d.ts',
      });
    });
  });

  describe('invalid flat file names', () => {
    it('returns null for names without underscore separator', () => {
      expect(parseFlatFileName('invalid-name.md')).toBeNull();
      expect(parseFlatFileName('README.md')).toBeNull();
      expect(parseFlatFileName('package.json')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseFlatFileName('')).toBeNull();
    });

    it('handles edge case with only underscore', () => {
      expect(parseFlatFileName('_')).toEqual({
        prefix: '',
        original: '',
      });
    });

    it('handles edge case with underscore at start', () => {
      expect(parseFlatFileName('_file.md')).toEqual({
        prefix: '',
        original: 'file.md',
      });
    });

    it('handles edge case with underscore at end', () => {
      expect(parseFlatFileName('prefix_')).toEqual({
        prefix: 'prefix',
        original: '',
      });
    });
  });

  describe('round-trip conversion', () => {
    it('correctly round-trips toFlatFileName and parseFlatFileName', () => {
      const testCases = [
        { prefix: 'canard-schemaForm', fileName: 'guide.md' },
        { prefix: 'winglet-reactUtils', fileName: 'expert/SKILL.md' },
        { prefix: 'lerx-promiseModal', fileName: 'src/utils/helper.ts' },
        { prefix: 'scope-packageName', fileName: 'docs/api/reference.md' },
      ];

      testCases.forEach(({ prefix, fileName }) => {
        const flatName = toFlatFileName(prefix, fileName);
        const parsed = parseFlatFileName(flatName);
        expect(parsed).not.toBeNull();
        expect(parsed?.prefix).toBe(prefix);
        expect(parsed?.original).toBe(fileName);
      });
    });
  });
});

describe('integration: packageNameToPrefix + toFlatFileName', () => {
  it('converts package name to flat file name end-to-end', () => {
    const packageName = '@canard/schema-form';
    const fileName = 'expert/SKILL.md';

    const prefix = packageNameToPrefix(packageName);
    const flatName = toFlatFileName(prefix, fileName);

    expect(flatName).toBe('canard-schemaForm_expert/SKILL.md');
  });

  it('handles multiple real-world examples', () => {
    const examples = [
      {
        packageName: '@winglet/react-utils',
        fileName: 'docs/guide.md',
        expected: 'winglet-reactUtils_docs/guide.md',
      },
      {
        packageName: '@lerx/promise-modal',
        fileName: 'README.md',
        expected: 'lerx-promiseModal_README.md',
      },
      {
        packageName: 'lodash',
        fileName: 'expert/knowledge/api.md',
        expected: 'lodash_expert/knowledge/api.md',
      },
    ];

    examples.forEach(({ packageName, fileName, expected }) => {
      const prefix = packageNameToPrefix(packageName);
      const flatName = toFlatFileName(prefix, fileName);
      expect(flatName).toBe(expected);
    });
  });
});
