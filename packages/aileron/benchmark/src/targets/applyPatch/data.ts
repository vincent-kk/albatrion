export const patches = [
  // 1. test 연산 (값 확인용)
  { op: 'test', path: '/user/name', value: 'Vincent' },

  // 2. replace 연산
  { op: 'replace', path: '/user/email', value: 'vincent@newdomain.com' },

  // 3. add 연산 - 객체 필드 추가
  { op: 'add', path: '/user/status', value: 'active' },

  // 4. add 연산 - 배열 중간 삽입
  { op: 'add', path: '/user/roles/1', value: 'editor' },

  // 5. remove 연산 - 배열 값 제거
  { op: 'remove', path: '/user/roles/0' },

  // 6. move 연산 - user.settings.theme → user.theme (상위로 이동)
  { op: 'move', from: '/user/settings/theme', path: '/user/theme' },

  // 7. copy 연산 - user.theme → user.settings.appearance
  { op: 'copy', from: '/user/theme', path: '/user/settings/appearance' },

  // 8. remove 연산 - 하위 객체 제거
  { op: 'remove', path: '/user/settings/notifications' },

  // 9. replace 연산 - 배열 내 객체 속성 변경
  { op: 'replace', path: '/projects/1/title', value: 'Gamma' },

  // 10. add 연산 - 배열에 새 프로젝트 추가
  {
    op: 'add',
    path: '/projects/-',
    value: { id: 'p3', title: 'Delta' },
  },
];
