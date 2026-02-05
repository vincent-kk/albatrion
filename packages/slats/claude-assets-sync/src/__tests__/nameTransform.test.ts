import { describe, expect, it } from 'vitest';

import {
  kebabToCamel,
  packageNameToPrefix,
  parseFlatFileName,
  toFlatFileName,
} from '../utils/nameTransform';

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
  it('creates flat file names with underscore separator', () => {
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

  it('converts path separators to underscores', () => {
    expect(toFlatFileName('canard-schemaForm', 'api/types.md')).toBe(
      'canard-schemaForm_api_types.md',
    );
    expect(toFlatFileName('winglet-reactUtils', 'docs/guide.md')).toBe(
      'winglet-reactUtils_docs_guide.md',
    );
    expect(toFlatFileName('lerx-promiseModal', 'src/utils/helper.ts')).toBe(
      'lerx-promiseModal_src_utils_helper.ts',
    );
  });

  it('handles Windows-style path separators', () => {
    expect(toFlatFileName('canard-schemaForm', 'api\\types.md')).toBe(
      'canard-schemaForm_api_types.md',
    );
    expect(toFlatFileName('winglet-reactUtils', 'docs\\api\\guide.md')).toBe(
      'winglet-reactUtils_docs_api_guide.md',
    );
  });

  it('handles mixed path separators', () => {
    expect(toFlatFileName('canard-schemaForm', 'api/docs\\guide.md')).toBe(
      'canard-schemaForm_api_docs_guide.md',
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
      'canard-schemaForm_a_b_c_d_e_file.md',
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

    it('parses flat file names with nested paths', () => {
      expect(parseFlatFileName('canard-schemaForm_api_types.md')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'api/types.md',
      });
      expect(parseFlatFileName('winglet-reactUtils_docs_guide.md')).toEqual({
        prefix: 'winglet-reactUtils',
        original: 'docs/guide.md',
      });
      expect(
        parseFlatFileName('lerx-promiseModal_src_utils_helper.ts'),
      ).toEqual({
        prefix: 'lerx-promiseModal',
        original: 'src/utils/helper.ts',
      });
    });

    it('parses deeply nested paths', () => {
      expect(parseFlatFileName('canard-schemaForm_a_b_c_d_e_file.md')).toEqual({
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

    it('handles prefix with underscores in original filename', () => {
      // Multiple underscores after prefix should be treated as path separators
      expect(parseFlatFileName('canard-schemaForm_my_file_name.md')).toEqual({
        prefix: 'canard-schemaForm',
        original: 'my/file/name.md',
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
        { prefix: 'winglet-reactUtils', fileName: 'api/types.md' },
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

    it('handles Windows paths in round-trip', () => {
      const prefix = 'canard-schemaForm';
      const windowsPath = 'api\\types.md';
      const flatName = toFlatFileName(prefix, windowsPath);

      const parsed = parseFlatFileName(flatName);
      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe(prefix);
      // Note: parseFlatFileName always returns forward slashes
      expect(parsed?.original).toBe('api/types.md');
    });
  });
});

describe('integration: packageNameToPrefix + toFlatFileName', () => {
  it('converts package name to flat file name end-to-end', () => {
    const packageName = '@canard/schema-form';
    const fileName = 'api/types.md';

    const prefix = packageNameToPrefix(packageName);
    const flatName = toFlatFileName(prefix, fileName);

    expect(flatName).toBe('canard-schemaForm_api_types.md');
  });

  it('handles multiple real-world examples', () => {
    const examples = [
      {
        packageName: '@winglet/react-utils',
        fileName: 'docs/guide.md',
        expected: 'winglet-reactUtils_docs_guide.md',
      },
      {
        packageName: '@lerx/promise-modal',
        fileName: 'README.md',
        expected: 'lerx-promiseModal_README.md',
      },
      {
        packageName: 'lodash',
        fileName: 'lib/index.js',
        expected: 'lodash_lib_index.js',
      },
    ];

    examples.forEach(({ packageName, fileName, expected }) => {
      const prefix = packageNameToPrefix(packageName);
      const flatName = toFlatFileName(prefix, fileName);
      expect(flatName).toBe(expected);
    });
  });
});
