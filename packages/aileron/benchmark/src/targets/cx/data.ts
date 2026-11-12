
export const testCases = [

  ['btn', 'primary', 'large'],


  {
    btn: true,
    'btn-primary': true,
    'btn-disabled': false,
    'btn-loading': true,
  },


  ['flex', 'items-center', { 'justify-between': true, 'gap-4': true }],


  [
    'container',
    ['mx-auto', 'px-4'],
    {
      'max-w-7xl': true,
      'max-w-sm': false,
    },
  ],


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


  ['text-sm', null, undefined, false, 'font-medium', ''],


  ['grid', 'grid-cols-', 12, 'gap-', 4],


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


  ['', 'block', null, 'w-full', undefined, false, 'h-10'],


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
