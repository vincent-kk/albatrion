import { describe, expect, it } from 'vitest';

import { escapePointer } from '../escapePointer';

describe('escapePointer', () => {
  describe('Basic escaping functionality', () => {
    it('should escape tilde characters in path segments', () => {
      expect(escapePointer('/users/john~doe/settings')).toBe(
        '/users/john~0doe/settings',
      );
      expect(escapePointer('/config/app~name/value')).toBe(
        '/config/app~0name/value',
      );
    });

    it('should NOT escape path separator slashes', () => {
      // 경로 분리자인 /는 이스케이프되지 않음
      expect(escapePointer('/files/config/database')).toBe(
        '/files/config/database',
      );
      expect(escapePointer('/docs/api/endpoints')).toBe('/docs/api/endpoints');
    });

    it('should only escape tildes within segments', () => {
      expect(escapePointer('/app~config/database~host/connection')).toBe(
        '/app~0config/database~0host/connection',
      );
      expect(escapePointer('/users/~/profile')).toBe('/users/~0/profile');
    });
  });

  describe('Segments containing slash as content', () => {
    it('should escape slashes when they are part of segment content', () => {
      // 세그먼트 이름 자체에 /가 포함된 경우 (실제로는 드문 경우)
      // 예: 객체의 키가 'path/to/file'인 경우
      expect(escapePointer('/segments/path~1to~1file/end')).toBe(
        '/segments/path~01to~01file/end',
      );
      expect(escapePointer('/config/url~1protocol/setting')).toBe(
        '/config/url~01protocol/setting',
      );
    });

    it('should handle pre-escaped content correctly', () => {
      // 이미 이스케이프된 내용이 들어오는 경우
      expect(escapePointer('/files/name~1with~1slashes/folder')).toBe(
        '/files/name~01with~01slashes/folder',
      );
      expect(escapePointer('/config/key~0with~0tildes/value')).toBe(
        '/config/key~00with~00tildes/value',
      );
    });
  });

  describe('Multiple segments with special characters', () => {
    it('should escape multiple tilde characters across different segments', () => {
      expect(escapePointer('/user~1/setting~2/value~3')).toBe(
        '/user~01/setting~02/value~03',
      );
      expect(escapePointer('/app~name/db~host/port~number')).toBe(
        '/app~0name/db~0host/port~0number',
      );
    });

    it('should handle mixed special characters correctly', () => {
      expect(escapePointer('/app~/config/db~/host')).toBe(
        '/app~0/config/db~0/host',
      );
      expect(escapePointer('/path/file~name/folder')).toBe(
        '/path/file~0name/folder',
      );
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty path', () => {
      expect(escapePointer('')).toBe('');
    });

    it('should handle root path', () => {
      expect(escapePointer('/')).toBe('/');
    });

    it('should handle single segment without leading slash', () => {
      expect(escapePointer('segment~name')).toBe('segment~0name');
      expect(escapePointer('normalname')).toBe('normalname');
    });

    it('should handle empty segments', () => {
      expect(escapePointer('//')).toBe('//');
      expect(escapePointer('///')).toBe('///');
      expect(escapePointer('/~//')).toBe('/~0//');
    });

    it('should handle consecutive special characters within segments', () => {
      expect(escapePointer('/segment~~content/normal')).toBe(
        '/segment~0~0content/normal',
      );
      expect(escapePointer('/~/path~/with')).toBe('/~0/path~0/with');
    });
  });

  describe('No escaping needed scenarios', () => {
    it('should return unchanged when no special characters present in segments', () => {
      expect(escapePointer('/users/john/settings')).toBe(
        '/users/john/settings',
      );
      expect(escapePointer('/config/database/host')).toBe(
        '/config/database/host',
      );
      expect(escapePointer('simple/path/here')).toBe('simple/path/here');
    });

    it('should handle paths with common safe characters', () => {
      expect(escapePointer('/users/jane.doe@company.com/preferences')).toBe(
        '/users/jane.doe@company.com/preferences',
      );
      expect(escapePointer('/api/v1/users/123/profile')).toBe(
        '/api/v1/users/123/profile',
      );
      expect(escapePointer('/data_2023/report_final/summary')).toBe(
        '/data_2023/report_final/summary',
      );
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle configuration keys with tildes', () => {
      expect(escapePointer('/env/production/database~config/host')).toBe(
        '/env/production/database~0config/host',
      );
      expect(escapePointer('/settings/theme~dark/mode')).toBe(
        '/settings/theme~0dark/mode',
      );
    });

    it('should handle user identifiers with special characters', () => {
      expect(escapePointer('/users/user~123/profile')).toBe(
        '/users/user~0123/profile',
      );
      expect(escapePointer('/accounts/admin~user/permissions')).toBe(
        '/accounts/admin~0user/permissions',
      );
    });

    it('should handle file names with tildes', () => {
      expect(escapePointer('/uploads/backup~2023/files')).toBe(
        '/uploads/backup~02023/files',
      );
      expect(escapePointer('/documents/temp~file/content')).toBe(
        '/documents/temp~0file/content',
      );
    });
  });

  describe('Complex scenarios', () => {
    it('should handle segments with multiple consecutive tildes', () => {
      expect(escapePointer('/config/key~~~value/setting')).toBe(
        '/config/key~0~0~0value/setting',
      );
      expect(escapePointer('/data/~~~~/end')).toBe('/data/~0~0~0~0/end');
    });

    it('should handle mixed special characters within segments', () => {
      expect(escapePointer('/path/segment~with~tildes/normal')).toBe(
        '/path/segment~0with~0tildes/normal',
      );
      expect(escapePointer('/config/~start~middle~end/value')).toBe(
        '/config/~0start~0middle~0end/value',
      );
    });
  });

  describe('RFC 6901 compliance', () => {
    it('should follow RFC 6901 escaping rules exactly', () => {
      // RFC 6901: 세그먼트 내의 ~만 이스케이프, 경로 분리자 /는 그대로
      expect(escapePointer('/foo/bar')).toBe('/foo/bar');
      expect(escapePointer('/a~b')).toBe('/a~0b');
    });

    it('should handle the RFC 6901 example scenarios correctly', () => {
      expect(escapePointer('/m~n')).toBe('/m~0n');
      expect(escapePointer('/ ')).toBe('/ '); // 공백은 이스케이프 불필요
      expect(escapePointer('/c%d')).toBe('/c%d'); // %는 이스케이프 불필요
      expect(escapePointer('/e^f')).toBe('/e^f'); // ^는 이스케이프 불필요
    });

    it('should only escape tilde characters as per RFC 6901', () => {
      // RFC 6901에서는 ~ 문자만 이스케이프함 (세그먼트 내에서)
      expect(escapePointer('/special!@#$%^&*()/chars')).toBe(
        '/special!@#$%^&*()/chars',
      );
      expect(escapePointer('/with~tilde/normal')).toBe('/with~0tilde/normal');
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly when building dynamic paths', () => {
      const buildUserSettingPath = (userId: string, setting: string) => {
        const rawPath = `/users/${userId}/settings/${setting}`;
        return escapePointer(rawPath);
      };

      expect(buildUserSettingPath('user~123', 'theme~dark')).toBe(
        '/users/user~0123/settings/theme~0dark',
      );

      expect(buildUserSettingPath('normaluser', 'normalsetting')).toBe(
        '/users/normaluser/settings/normalsetting',
      );
    });

    it('should handle paths from user input safely', () => {
      const userInputs = [
        'config~production',
        'normal_key',
        '~hidden',
        'multi~ple~tildes',
      ];

      const expectedResults = [
        '/data/config~0production',
        '/data/normal_key',
        '/data/~0hidden',
        '/data/multi~0ple~0tildes',
      ];

      userInputs.forEach((input, index) => {
        expect(escapePointer(`/data/${input}`)).toBe(expectedResults[index]);
      });
    });
  });

  describe('Performance scenarios', () => {
    it('should efficiently handle long paths without special characters', () => {
      const longPath =
        '/very/long/path/with/many/segments/but/no/special/characters/at/all/in/any/segment';
      expect(escapePointer(longPath)).toBe(longPath);
    });

    it('should efficiently handle paths with only some segments needing escaping', () => {
      expect(
        escapePointer(
          '/normal/segments/with/one~special/and/more/normal/segments',
        ),
      ).toBe('/normal/segments/with/one~0special/and/more/normal/segments');
    });
  });
});
