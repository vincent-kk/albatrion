import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/17. OneOf',
};

export const OneOf = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        computed: {
          if: "./category === 'game'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price: { type: 'number' },
        },
      },
      {
        computed: {
          if: "./category === 'movie'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        computed: {
          if: "./category === 'console'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie', 'console'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfAlias = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category === 'movie'",
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category === 'game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfWithConstFieldCondition = () => {
  const schema = {
    type: 'object',
    propertyKeys: [
      'employmentType',
      'commonField',
      'contractType',
      'workingHours',
    ],
    properties: {
      employmentType: {
        type: 'string',
        enum: ['full_time', 'part_time', 'contractor'],
        title: 'Employment Type',
        default: 'contractor',
      },
      commonField: {
        type: 'string',
        title: 'Common Field',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },

    oneOf: [
      {
        properties: {
          employmentType: {
            const: 'full_time',
          },
          salary: {
            type: 'number',
            title: 'Annual Salary',
          },
          bonus: {
            type: 'number',
            title: 'Annual Bonus',
          },
          benefits: {
            type: 'object',
            title: 'Employee Benefits',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: 'Health Insurance',
              },
              pension: {
                type: 'boolean',
                title: 'Retirement Plan',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: 'Probation Period (Months)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        properties: {
          employmentType: {
            const: 'part_time',
          },
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'fixed_term', 'seasonal'],
            title: 'Contract Type',
            default: 'fixed_term',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 1,
            maximum: 40,
          },
        },
      },
      {
        properties: {
          employmentType: {
            const: 'contractor',
          },
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'project_based', 'retainer'],
            title: 'Contract Type',
            default: 'hourly_rate',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 41,
            maximum: 168,
            computed: {
              active: '../contractType === "hourly_rate"',
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfWithEnumFieldCondition = () => {
  const schema = {
    type: 'object',
    propertyKeys: [
      'employmentType',
      'commonField',
      'contractType',
      'workingHours',
    ],
    properties: {
      employmentType: {
        type: 'string',
        enum: ['full_time', 'part_time', 'contractor'],
        title: 'Employment Type',
        default: 'contractor',
      },
      commonField: {
        type: 'string',
        title: 'Common Field',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        properties: {
          employmentType: {
            const: 'full_time',
          },
          salary: {
            type: 'number',
            title: 'Annual Salary',
          },
          bonus: {
            type: 'number',
            title: 'Annual Bonus',
          },
          benefits: {
            type: 'object',
            title: 'Employee Benefits',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: 'Health Insurance',
              },
              pension: {
                type: 'boolean',
                title: 'Retirement Plan',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: 'Probation Period (Months)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        properties: {
          employmentType: {
            enum: ['part_time', 'contractor'],
          },
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'fixed_term', 'seasonal'],
            title: 'Contract Type',
            default: 'fixed_term',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            '&active': '../contractType === "fixed_term"',
            minimum: 1,
            maximum: 40,
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfWithConditionalExpression = () => {
  const schema = {
    type: 'object',
    propertyKeys: [
      'employmentType',
      'commonField',
      'contractType',
      'workingHours',
    ],
    properties: {
      employmentType: {
        type: 'string',
        enum: ['full_time', 'part_time', 'contractor'],
        title: 'Employment Type',
        default: 'contractor',
      },
      commonField: {
        type: 'string',
        title: 'Common Field',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        computed: {
          if: "./employmentType === 'full_time'",
        },
        properties: {
          salary: {
            type: 'number',
            title: 'Annual Salary',
          },
          bonus: {
            type: 'number',
            title: 'Annual Bonus',
          },
          benefits: {
            type: 'object',
            title: 'Employee Benefits',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: 'Health Insurance',
              },
              pension: {
                type: 'boolean',
                title: 'Retirement Plan',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: 'Probation Period (Months)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'part_time'",
        },
        properties: {
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'fixed_term', 'seasonal'],
            title: 'Contract Type',
            default: 'fixed_term',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 1,
            maximum: 40,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'contractor'",
        },
        properties: {
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'project_based', 'retainer'],
            title: 'Contract Type',
            default: 'hourly_rate',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 41,
            maximum: 168,
            computed: {
              active: '../contractType === "hourly_rate"',
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfWithConditionalExpressionAndFieldCondition = () => {
  const schema = {
    type: 'object',
    propertyKeys: [
      'employmentType',
      'commonField',
      'contractType',
      'workingHours',
    ],
    properties: {
      employmentType: {
        type: 'string',
        enum: ['full_time', 'part_time', 'contractor'],
        title: 'Employment Type',
        default: 'contractor',
      },
      commonField: {
        type: 'string',
        title: 'Common Field',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        computed: {
          if: "./commonField === 'wow1'",
        },
        properties: {
          employmentType: {
            const: 'full_time',
          },
          salary: {
            type: 'number',
            title: 'Annual Salary',
          },
          bonus: {
            type: 'number',
            title: 'Annual Bonus',
          },
          benefits: {
            type: 'object',
            title: 'Employee Benefits',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: 'Health Insurance',
              },
              pension: {
                type: 'boolean',
                title: 'Retirement Plan',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: 'Probation Period (Months)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        computed: {
          if: "./commonField === 'wow2'",
        },
        properties: {
          employmentType: {
            const: 'part_time',
          },
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'fixed_term', 'seasonal'],
            title: 'Contract Type',
            default: 'fixed_term',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 1,
            maximum: 40,
          },
        },
      },
      {
        computed: {
          if: "./commonField === 'wow3'",
        },
        properties: {
          employmentType: {
            const: 'contractor',
          },
          contractType: {
            type: 'string',
            enum: ['hourly_rate', 'project_based', 'retainer'],
            title: 'Contract Type',
            default: 'hourly_rate',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 41,
            maximum: 168,
            computed: {
              active: '../contractType === "hourly_rate"',
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfAliasWithKeyOrder = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category === 'movie'",
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category === 'game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
    propertyKeys: ['title', 'price1', 'price2', 'date1', 'date2'],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const ComplexOneOf = () => {
  const schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
      details: {
        type: 'object',
        oneOf: [
          {
            '&if': "../type === 'game'",
            properties: {
              stages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                  default: {
                    label: 1,
                    name: 'stage 1',
                    description: 'stage 1 description',
                  },
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['pc', 'console', 'mobile'],
                },
                default: ['pc', 'console'],
              },
              specs: {
                type: 'object',
                properties: {
                  cpu: { type: 'string', default: 'Intel Core i5' },
                  gpu: {
                    type: 'string',
                    default: 'NVIDIA GeForce GTX 1660 Ti',
                  },
                  memory: { type: 'string', default: '16GB' },
                  storage: { type: 'string', default: '1TB' },
                },
              },
            },
          },
          {
            '&if': "../type === 'movie'",
            properties: {
              genres: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'action',
                    'comedy',
                    'drama',
                    'horror',
                    'romance',
                    'sci-fi',
                    'thriller',
                  ],
                  default: 'romance',
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['theater', 'streaming'],
                },
                default: ['theater'],
              },
              actors: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        ],
      },
    },
    oneOf: [
      {
        '&if': "./type === 'game'",
        properties: {
          owner: { type: 'string', placeholder: 'developer of the game' },
        },
      },
      {
        '&if': "./type === 'movie'",
        properties: {
          owner: { type: 'string', placeholder: 'director of the movie' },
        },
      },
    ],
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle =
    useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={setValue}
        onValidate={(errors) => setErrors(errors || [])}
      />
    </StoryLayout>
  );
};

export const ComplexOneOfSmall = () => {
  const schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      details: {
        type: 'object',
        oneOf: [
          {
            '&if': "../type === 'game'",
            properties: {
              stages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                  default: {
                    label: 1,
                    name: 'stage 1',
                    description: 'stage 1 description',
                  },
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['pc', 'console', 'mobile'],
                },
                default: ['pc', 'console'],
              },
              specs: {
                type: 'object',
                properties: {
                  cpu: { type: 'string', default: 'Intel Core i5' },
                  gpu: {
                    type: 'string',
                    default: 'NVIDIA GeForce GTX 1660 Ti',
                  },
                  memory: { type: 'string', default: '16GB' },
                  storage: { type: 'string', default: '1TB' },
                },
              },
            },
          },
          {
            '&if': "../type === 'movie'",
            properties: {
              genres: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'action',
                    'comedy',
                    'drama',
                    'horror',
                    'romance',
                    'sci-fi',
                    'thriller',
                  ],
                  default: 'romance',
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['theater', 'streaming'],
                },
                default: ['theater'],
              },
              actors: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle =
    useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={setValue}
        onValidate={(errors) => setErrors(errors || [])}
      />
    </StoryLayout>
  );
};

export const ErrorCase1 = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category === 'movie'",
        properties: {
          category: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          title: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category === 'game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const ErrorCase2 = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category === 'movie'",
        type: 'object', // 부모와 같은 타입은 허용됨
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category === 'game'",
        type: 'string', // 부모와 다른 타입은 허용되지 않음
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};
