import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
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
            default: 100,
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
        enum: ['full_time', 'part_time', 'contractor', 'none'],
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

export const OneOfWithConditionalExpressionInArray = () => {
  const schema = {
    type: 'array',
    items: {
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
    },
    minItems: 3,
    maxItems: 3,
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<any[]>([]);
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

export const OneOfWithConditionalExpressionInObject = () => {
  const schema = {
    type: 'object',
    properties: {
      oneOf: {
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
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<any[]>([]);
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

export const Array = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['real world', 'internet'],
        default: 'real world',
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          oneOf: [
            {
              '&if': '(/type)==="real world"',
              properties: {
                name: {
                  type: 'string',
                  default: 'John Doe',
                },
                age: {
                  type: 'number',
                  default: 30,
                },
                nationality: {
                  type: 'string',
                  default: 'United States',
                },
              },
            },
            {
              '&if': '(/type)==="internet"',
              properties: {
                ip: {
                  type: 'string',
                  default: '192.168.0.1',
                },
                port: {
                  type: 'number',
                  default: 80,
                },
                domainName: {
                  type: 'string',
                  default: 'example.com',
                },
              },
            },
          ],
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>[]>([]);
  const ref = useRef<FormHandle<typeof jsonSchema, typeof value>>(null);

  return (
    <div>
      <button
        onClick={() => {
          const node = ref.current?.node?.find('/items');
          if (node?.type === 'array') {
            node.setValue(undefined);
          }
        }}
      >
        remove items filed
      </button>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} ref={ref} />
      </StoryLayout>
    </div>
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

export const ComplexNestedOneOf = () => {
  const schema = {
    type: 'object',
    properties: {
      productType: {
        type: 'string',
        enum: ['physical', 'digital', 'service'],
        default: 'physical',
      },
      product: {
        type: 'object',
        oneOf: [
          {
            computed: {
              if: "../productType === 'physical'",
            },
            properties: {
              name: { type: 'string' },
              weight: { type: 'number', minimum: 0 },
              dimensions: {
                type: 'object',
                properties: {
                  length: { type: 'number', minimum: 0 },
                  width: { type: 'number', minimum: 0 },
                  height: { type: 'number', minimum: 0 },
                },
              },
              shipping: {
                type: 'object',
                properties: {
                  method: {
                    type: 'string',
                    enum: ['standard', 'express'],
                    default: 'standard',
                  },
                },
                oneOf: [
                  {
                    computed: {
                      if: "./method === 'standard'",
                    },
                    properties: {
                      cost: { type: 'number', minimum: 0 },
                      days: { type: 'number', minimum: 1, maximum: 30 },
                    },
                  },
                  {
                    computed: {
                      if: "./method === 'express'",
                    },
                    properties: {
                      cost: { type: 'number', minimum: 10 },
                      hours: { type: 'number', minimum: 1, maximum: 72 },
                    },
                  },
                ],
              },
            },
            required: ['name', 'weight'],
          },
          {
            computed: {
              if: "../productType === 'digital'",
            },
            properties: {
              name: { type: 'string' },
              fileSize: { type: 'number', minimum: 0 },
              format: { type: 'string' },
              downloadLink: { type: 'string', format: 'uri' },
            },
            required: ['name', 'fileSize', 'format'],
          },
          {
            computed: {
              if: "../productType === 'service'",
            },
            properties: {
              name: { type: 'string' },
              duration: { type: 'number', minimum: 0 },
              durationUnit: {
                type: 'string',
                enum: ['hours', 'days', 'months'],
              },
              availability: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ],
                },
              },
            },
            required: ['name', 'duration', 'durationUnit'],
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const [injectedValue, setInjectedValue] = useState<string>('');

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20 }}>
        <h4>Value Injection via RefHandle</h4>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            value={injectedValue}
            onChange={(e) => setInjectedValue(e.target.value)}
            placeholder="Enter product name"
          />
          <button
            onClick={() => {
              const currentValue = formHandle.current?.getValue() || {};
              formHandle.current?.setValue({
                ...currentValue,
                product: {
                  ...currentValue.product,
                  name: injectedValue,
                },
              });
            }}
          >
            Inject Name
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              formHandle.current?.setValue({
                productType: 'physical',
                product: {
                  name: 'Laptop',
                  weight: 2.5,
                  dimensions: { length: 35, width: 25, height: 2 },
                  shipping: { method: 'express', cost: 25, hours: 24 },
                },
              });
            }}
          >
            Physical Product
          </button>
          <button
            onClick={() => {
              formHandle.current?.setValue({
                productType: 'digital',
                product: {
                  name: 'Software License',
                  fileSize: 1024,
                  format: 'exe',
                  downloadLink: 'https://example.com/download',
                },
              });
            }}
          >
            Digital Product
          </button>
          <button
            onClick={() => {
              formHandle.current?.setValue({
                productType: 'service',
                product: {
                  name: 'Consulting',
                  duration: 2,
                  durationUnit: 'hours',
                  availability: ['monday', 'wednesday', 'friday'],
                },
              });
            }}
          >
            Service Product
          </button>
        </div>
      </div>
    </StoryLayout>
  );
};

export const OneOfPrimitiveValuePreservationDemo = () => {
  const schema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['text', 'number', 'mixed'],
        default: 'text',
        title: 'Data Mode',
      },
    },
    oneOf: [
      {
        computed: {
          if: "./mode === 'text'",
        },
        properties: {
          textValue: {
            type: 'string',
            title: 'Text Value',
            default: 'default text',
          },
          label: { type: 'string', title: 'Label' },
          isActive: { type: 'boolean', title: 'Active', default: true },
          count: { type: 'number', title: 'Count', default: 0 },
        },
      },
      {
        computed: {
          if: "./mode === 'number'",
        },
        properties: {
          numberValue: { type: 'number', title: 'Number Value', default: 42 },
          label: { type: 'string', title: 'Label' }, // Same name, same type
          isActive: { type: 'boolean', title: 'Active' }, // Same name, same type
          count: { type: 'string', title: 'Count (as text)' }, // Same name, different type!
          precision: { type: 'number', title: 'Precision', default: 2 },
        },
      },
      {
        computed: {
          if: "./mode === 'mixed'",
        },
        properties: {
          textValue: { type: 'number', title: 'Text as Number' }, // Same name, different type!
          numberValue: { type: 'string', title: 'Number as Text' }, // Same name, different type!
          label: { type: 'string', title: 'Label' }, // Same name, same type
          isActive: { type: 'boolean', title: 'Active', default: false },
          customData: { type: 'string', title: 'Custom Data' },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          marginBottom: 20,
          padding: 15,
          border: '1px solid #ccc',
          borderRadius: 5,
          backgroundColor: '#f9f9f9',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>
          OneOf Primitive Value Preservation Demo
        </h4>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#666' }}>
          This demo shows how primitive values are preserved when switching
          between oneOf branches. Values are preserved only if the field has the
          same name and the same primitive type.
        </p>
        <ul style={{ margin: 0, fontSize: 14, color: '#666', paddingLeft: 20 }}>
          <li>
            <strong>Same name + same type</strong>: Value is preserved
          </li>
          <li>
            <strong>Same name + different type</strong>: Value is reset
          </li>
          <li>
            <strong>Default values</strong>: Take precedence over preserved
            values
          </li>
          <li>
            <strong>Missing fields</strong>: Values are cleared when switching
            branches
          </li>
        </ul>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div
        style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}
      >
        <button
          onClick={() => {
            formHandle.current?.setValue({
              mode: 'text',
              textValue: 'Custom Text',
              label: 'Text Label',
              isActive: false,
              count: 5,
            });
          }}
        >
          Set Text Mode Values
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              mode: 'number',
            });
          }}
        >
          Switch to Number Mode
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              mode: 'mixed',
            });
          }}
        >
          Switch to Mixed Mode
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              mode: 'text',
            });
          }}
        >
          Back to Text Mode
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              mode: 'number',
              numberValue: 999,
              label: 'Number Label',
              isActive: true,
              count: 'One Hundred',
              precision: 4,
            });
          }}
        >
          Set Number Mode Values
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              mode: 'mixed',
              textValue: 123,
              numberValue: 'Mixed Number',
              label: 'Mixed Label',
              isActive: true,
              customData: 'Some custom data',
            });
          }}
        >
          Set Mixed Mode Values
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset Form</button>
        <button
          onClick={() => {
            console.log(
              'Current Value:',
              JSON.stringify(formHandle.current?.getValue(), null, 2),
            );
          }}
        >
          Log Current State
        </button>
      </div>
      <div
        style={{
          marginTop: 15,
          padding: 10,
          backgroundColor: '#f0f8ff',
          border: '1px solid #cce7ff',
          borderRadius: 5,
        }}
      >
        <h5 style={{ margin: '0 0 5px 0', color: '#0066cc' }}>
          Test Scenario:
        </h5>
        <ol style={{ margin: 0, fontSize: 13, color: '#333', paddingLeft: 20 }}>
          <li>Click "Set Text Mode Values" to set initial values</li>
          <li>
            Click "Switch to Number Mode" - observe which values are preserved:
            <ul>
              <li>"label" (string): ✅ Preserved (same type)</li>
              <li>"isActive" (boolean): ✅ Preserved (same type)</li>
              <li>"count": ❌ Reset (number → string, different type)</li>
              <li>"textValue": ❌ Cleared (not in number schema)</li>
            </ul>
          </li>
          <li>Click "Switch to Mixed Mode" - see type compatibility logic</li>
          <li>
            Experiment with different combinations to see preservation behavior
          </li>
        </ol>
      </div>
    </StoryLayout>
  );
};

export const SimpleOneOfTypePreservation = () => {
  const schema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['text', 'number'],
        default: 'text',
        title: 'Field Mode',
      },
    },
    oneOf: [
      {
        computed: { if: "./mode === 'text'" },
        properties: {
          name: { type: 'string', title: 'Name (string)' }, // Same name, same type
          value: {
            type: 'string',
            title: 'Text Value',
            default: 'default text',
          }, // Different name
        },
      },
      {
        computed: { if: "./mode === 'number'" },
        properties: {
          name: { type: 'string', title: 'Name (string)' }, // Same name, same type
          value: { type: 'number', title: 'Number Value', default: 42 }, // Same name, different type!
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          marginBottom: 15,
          padding: 10,
          backgroundColor: '#fff3cd',
          borderRadius: 5,
        }}
      >
        <h4 style={{ margin: '0 0 5px 0' }}>OneOf Type Preservation Test</h4>
        <p style={{ margin: 0, fontSize: 12 }}>
          ✅ <strong>name</strong> (string→string): Value preserved
          <br />❌ <strong>value</strong> (string→number): Value reset, default
          used
        </p>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              mode: 'text',
              name: 'John',
              value: 'custom text',
            })
          }
        >
          Set Text Mode
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({ ...current, mode: 'number' });
          }}
        >
          Switch to Number
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({ ...current, mode: 'text' });
          }}
        >
          Switch to Text
        </button>
      </div>
    </StoryLayout>
  );
};

export const PreferDefaultValues = () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      profile: {
        type: 'string',
        enum: ['dev', 'prod', 'test'],
        default: 'dev',
      },
    },
    oneOf: [
      {
        '&if': "./profile === 'dev'",
        properties: {
          debug: { type: 'boolean', default: true },
          logLevel: { type: 'string', default: 'verbose' },
          port: { type: 'number', default: 3000 },
        },
      },
      {
        '&if': "./profile === 'prod'",
        properties: {
          debug: { type: 'boolean', default: false },
          logLevel: { type: 'string', default: 'error' },
          port: { type: 'number', default: 8080 },
          secure: { type: 'boolean', default: true },
        },
      },
      {
        '&if': "./profile === 'test'",
        properties: {
          debug: { type: 'boolean' }, // No default
          logLevel: { type: 'string' }, // No default
          port: { type: 'string' }, // Different type!
          testMode: { type: 'boolean', default: true },
        },
      },
    ],
  };

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <button onClick={() => formHandle.current?.setValue({ profile: 'dev' })}>
        Set Dev Mode
      </button>
      <button onClick={() => formHandle.current?.setValue({ profile: 'prod' })}>
        Set Prod Mode
      </button>
      <button onClick={() => formHandle.current?.setValue({ profile: 'test' })}>
        Set Test Mode
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            profile: 'test',
            debug: true,
            logLevel: 'verbose',
            port: 3000,
            secure: true,
            testMode: true,
          })
        }
      >
        Set Value
      </button>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfPreservation = () => {
  const schema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['A', 'B'],
        default: 'A',
      },
    },
    oneOf: [
      {
        '&if': "./mode === 'A'",
        properties: {
          branch: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              A_value: { type: 'string' },
              A_value2: { type: 'number' },
              A_value3: { type: 'boolean' },
            },
            terminal: false,
            FormTypeInput: ({ value, ChildNodeComponents, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: 'valueA',
                        A_value: 'valueA',
                        A_value2: 100,
                        A_value3: true,
                        B_value: 'valueB',
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                  <div>
                    {ChildNodeComponents.map((ChildNodeComponent) => (
                      <ChildNodeComponent key={ChildNodeComponent.key} />
                    ))}
                  </div>
                </div>
              );
            },
          },
          terminal: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              A_value: { type: 'string' },
              A_value2: { type: 'number' },
              A_value3: { type: 'boolean' },
            },
            FormTypeInput: ({ value, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: 'valueA',
                        A_value: 'valueA',
                        A_value2: 100,
                        A_value3: true,
                        B_value: 'valueB',
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                </div>
              );
            },
          },
        },
      },
      {
        '&if': "./mode === 'B'",
        properties: {
          branch: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              B_value: { type: 'string' },
              B_value2: { type: 'number' },
              B_value3: { type: 'boolean' },
            },
            terminal: false,
            additionalProperties: false,
            FormTypeInput: ({ value, ChildNodeComponents, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: 'valueA',
                        A_value: 'valueA',
                        A_value2: 100,
                        A_value3: true,
                        B_value: 'valueB',
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                  <div>
                    {ChildNodeComponents.map((ChildNodeComponent) => (
                      <ChildNodeComponent key={ChildNodeComponent.key} />
                    ))}
                  </div>
                </div>
              );
            },
          },
          terminal: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              B_value: { type: 'string' },
              B_value2: { type: 'number' },
              B_value3: { type: 'boolean' },
            },
            additionalProperties: false,
            FormTypeInput: ({ value, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: 'valueA',
                        A_value: 'valueA',
                        A_value2: 100,
                        A_value3: true,
                        B_value: 'valueB',
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                </div>
              );
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
      <button
        onClick={() =>
          formHandle.current?.setValue({ mode: 'A' }, SetValueOption.Merge)
        }
      >
        Set Mode A
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ mode: 'B' }, SetValueOption.Merge)
        }
      >
        Set Mode B
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            mode: 'A',
            branch: {
              value: 'valueA',
              A_value: 'valueA',
              A_value2: 100,
              A_value3: true,
              B_value: 'valueB',
              B_value2: 100,
              B_value3: true,
            },
            terminal: {
              value: 'valueA',
              A_value: 'valueA',
              A_value2: 100,
              A_value3: true,
              B_value: 'valueB',
              B_value2: 100,
              B_value3: true,
            },
          })
        }
      >
        Set Mode A (Overwrite)
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            mode: 'B',
            branch: {
              value: 'valueB',
              A_value: 'valueA',
              A_value2: 100,
              A_value3: true,
              B_value: 'valueB',
              B_value2: 100,
              B_value3: true,
            },
            terminal: {
              value: 'valueA',
              A_value: 'valueA',
              A_value2: 100,
              A_value3: true,
              B_value: 'valueB',
              B_value2: 100,
              B_value3: true,
            },
          })
        }
      >
        Set Mode B (Overwrite)
      </button>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};
