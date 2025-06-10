import { describe, expect, it } from 'vitest';

import { escapePath } from '../escapePath';

describe('escapePath', () => {
  // Test case 1: 빈 문자열과 기본 케이스
  it('should return an empty string for an empty input', () => {
    expect(escapePath('')).toBe('');
  });

  it('should handle single segment without special characters', () => {
    expect(escapePath('foo')).toBe('foo');
    expect(escapePath('bar123')).toBe('bar123');
    expect(escapePath('simpleString')).toBe('simpleString');
  });

  // Test case 2: 기본적인 경로 (특수 문자 없음)
  it('should handle simple paths without special characters', () => {
    expect(escapePath('/user/name')).toBe('/user/name');
    expect(escapePath('/items/0/value')).toBe('/items/0/value');
    expect(escapePath('/a/b/c/d')).toBe('/a/b/c/d');
  });

  // Test case 3: 단일 특수 문자 이스케이핑
  it('should escape paths with single type special characters', () => {
    // '/' 문자 (segment 내부)
    expect(escapePath('/user/name/first')).toBe('/user/name/first');
    expect(escapePath('/path/to/file')).toBe('/path/to/file');

    // '~' 문자
    expect(escapePath('/user/~name')).toBe('/user/~0name');
    expect(escapePath('/items/~0/value')).toBe('/items/~00/value');
    expect(escapePath('/~root/~data')).toBe('/~0root/~0data');

    // '.' 문자 (current directory)
    expect(escapePath('/user/name.first')).toBe('/user/name~3first');
    expect(escapePath('/items/.hidden')).toBe('/items/~3hidden');
    expect(escapePath('/path/file.txt')).toBe('/path/file~3txt');

    // '*' 문자 (wildcard)
    expect(escapePath('/items/*/value')).toBe('/items/~4/value');
    expect(escapePath('/users/all*')).toBe('/users/all~4');
    expect(escapePath('/search/*query')).toBe('/search/~4query');

    // '#' 문자 (root fragment)
    expect(escapePath('/fragment/#root')).toBe('/fragment/~5root');
    expect(escapePath('/hash/tag#')).toBe('/hash/tag~5');
    expect(escapePath('/#anchor/link')).toBe('/~5anchor/link');

    // '..' 문자 (parent directory)
    expect(escapePath('/parent/../sibling')).toBe('/parent/~2/sibling');
    expect(escapePath('/path/..back')).toBe('/path/~2back');
    expect(escapePath('/folder/../..')).toBe('/folder/~2/~2');
  });

  // Test case 4: 복합 특수 문자 이스케이핑
  it('should escape paths with multiple types of special characters', () => {
    expect(escapePath('/user/name~.first')).toBe('/user/name~0~3first');
    expect(escapePath('/items/*/~hidden')).toBe('/items/~4/~0hidden');
    expect(escapePath('/path/file.txt~backup')).toBe('/path/file~3txt~0backup');
    expect(escapePath('/complex/~*.#path')).toBe('/complex/~0~4~3~5path');
  });

  // Test case 5: 연속된 특수 문자
  it('should handle consecutive special characters', () => {
    expect(escapePath('/~~double')).toBe('/~0~0double');
    expect(escapePath('/path/../..')).toBe('/path/~2/~2');
    expect(escapePath('/multi/**star')).toBe('/multi/~4~4star');
    expect(escapePath('/dots/...')).toBe('/dots/~2~3');
    expect(escapePath('/mixed/~#*.')).toBe('/mixed/~0~5~4~3');
  });

  // Test case 6: 실제 JSON Pointer 예시들
  it('should handle real-world JSON Pointer examples', () => {
    // RFC 6901의 예시들을 기반으로
    expect(escapePath('/foo/bar')).toBe('/foo/bar');
    expect(escapePath('/foo/0')).toBe('/foo/0');
    expect(escapePath('/')).toBe('/');
    expect(escapePath('/a~1b')).toBe('/a~01b'); // 이미 이스케이프된 문자
    expect(escapePath('/c%d')).toBe('/c%d'); // % 문자는 이스케이프되지 않음
    expect(escapePath('/e^f')).toBe('/e^f'); // ^ 문자는 이스케이프되지 않음
    expect(escapePath('/g|h')).toBe('/g|h'); // | 문자는 이스케이프되지 않음
    expect(escapePath('/i\\j')).toBe('/i\\j'); // \\ 문자는 이스케이프되지 않음
    expect(escapePath('/k"l')).toBe('/k"l'); // " 문자는 이스케이프되지 않음
  });

  // Test case 7: 복잡한 실제 사용 사례
  it('should handle complex real-world use cases', () => {
    expect(escapePath('/users/123/profile.settings')).toBe(
      '/users/123/profile~3settings',
    );
    expect(escapePath('/api/v1/search/*/results')).toBe(
      '/api/v1/search/~4/results',
    );
    expect(escapePath('/config/database/~connection')).toBe(
      '/config/database/~0connection',
    );
    expect(escapePath('/files/backup/../current')).toBe(
      '/files/backup/~2/current',
    );
    expect(escapePath('/navigation/#main/sidebar')).toBe(
      '/navigation/~5main/sidebar',
    );
    expect(escapePath('/data/users.*.profile')).toBe(
      '/data/users~3~4~3profile',
    );
  });

  // Test case 8: 극단적인 케이스들
  it('should handle edge cases', () => {
    // 루트만
    expect(escapePath('/')).toBe('/');

    // 모든 특수 문자가 포함된 segment
    expect(escapePath('/all~...*#special')).toBe('/all~0~2~3~4~5special');

    // 매우 긴 경로
    expect(
      escapePath('/very/long/path/with/many/segments/and.special*chars'),
    ).toBe('/very/long/path/with/many/segments/and~3special~4chars');

    // 빈 segment들
    expect(escapePath('//empty//segments//')).toBe('//empty//segments//');

    // 숫자로만 이루어진 경로
    expect(escapePath('/123/456/789')).toBe('/123/456/789');
  });

  // Test case 9: 성능 최적화 검증 (safe segment)
  it('should handle safe segments efficiently', () => {
    // 이스케이핑이 필요 없는 안전한 경로들
    expect(escapePath('/users/john/email')).toBe('/users/john/email');
    expect(escapePath('/products/123/name')).toBe('/products/123/name');
    expect(escapePath('/simple/safe/path')).toBe('/simple/safe/path');
  });

  // Test case 10: 공식 예시 (documentation에서 언급된)
  it('should match the examples from function documentation', () => {
    expect(escapePath('/user/name.first')).toBe('/user/name~3first');
    expect(escapePath('/items/*/value')).toBe('/items/~4/value');
    expect(escapePath('/parent/../sibling')).toBe('/parent/~2/sibling');
  });
});
