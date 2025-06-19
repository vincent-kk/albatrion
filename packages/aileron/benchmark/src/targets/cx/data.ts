// cx 라이브러리 성능 테스트를 위한 다양한 클래스명 조합 데이터
export const testCases = [
  // 1. 기본 문자열들
  ['btn', 'primary', 'large'],

  // 2. 조건부 객체
  {
    btn: true,
    'btn-primary': true,
    'btn-disabled': false,
    'btn-loading': true,
  },

  // 3. 배열과 문자열 혼합
  ['flex', 'items-center', { 'justify-between': true, 'gap-4': true }],

  // 4. 중첩된 배열
  [
    'container',
    ['mx-auto', 'px-4'],
    {
      'max-w-7xl': true,
      'max-w-sm': false,
    },
  ],

  // 5. 복잡한 조건부 클래스
  {
    relative: true,
    'overflow-hidden': true,
    'rounded-lg': true,
    'shadow-sm': true,
    border: true,
    'border-gray-200': true,
    'hover:shadow-md': true,
    'focus:outline-none': true,
    'focus:ring-2': true,
    'focus:ring-blue-500': false,
    'disabled:opacity-50': false,
    'disabled:cursor-not-allowed': false,
  },

  // 6. Falsy 값들이 포함된 케이스
  ['text-sm', null, undefined, false, 'font-medium', ''],

  // 7. 숫자와 문자열 혼합
  ['grid', 'grid-cols-', 12, 'gap-', 4],

  // 8. 매우 긴 클래스명 조합 (실제 UI 컴포넌트에서 사용될 수 있는)
  [
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'bg-white',
    'bg-opacity-75',
    'backdrop-blur-sm',
    {
      'pointer-events-none': true,
      'transition-opacity': true,
      'duration-300': true,
      'ease-in-out': true,
      'opacity-100': true,
      'opacity-0': false,
    },
  ],

  // 9. 빈 값들과 유효한 값들의 혼합
  ['', 'block', null, 'w-full', undefined, false, 'h-10'],

  // 10. 중첩도가 높은 복잡한 구조
  [
    'form-control',
    [
      'input-group',
      {
        'input-group-lg': true,
        'has-validation': true,
      },
      [
        'form-control',
        {
          'is-valid': false,
          'is-invalid': true,
        },
      ],
    ],
    {
      'mb-3': true,
      'was-validated': false,
    },
  ],
];

// 단일 인수 테스트용 간단한 케이스들
export const simpleTestCases = [
  'btn',
  'btn primary',
  'btn primary large',
  '',
  null,
  undefined,
  false,
  true,
  0,
  42,
  ['btn', 'primary'],
  { btn: true, primary: true },
  { btn: true, primary: false },
];
