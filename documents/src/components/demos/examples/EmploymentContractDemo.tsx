import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    employmentType: {
      type: 'string',
      enum: ['full_time', 'part_time', 'contractor'],
      title: 'Employment Type',
      default: 'full_time',
      description: 'Different fields appear based on the employment type',
    },
    commonField: {
      type: 'string',
      title: 'Employee Name',
      placeholder: 'e.g. Jane Smith',
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
        employmentType: { const: 'full_time' },
        salary: {
          type: 'number',
          title: 'Annual Salary',
          default: 60000,
          description: 'Annual base salary in USD',
        },
        bonus: {
          type: 'number',
          title: 'Annual Bonus',
          default: 5000,
          description: 'Annual performance bonus in USD',
        },
        benefits: {
          type: 'object',
          title: 'Employee Benefits',
          properties: {
            healthInsurance: {
              type: 'boolean',
              title: 'Health Insurance',
              default: true,
            },
            pension: {
              type: 'boolean',
              title: 'Retirement Plan',
              default: true,
            },
          },
        },
        probationPeriod: {
          type: 'number',
          title: 'Probation Period (Months)',
          minimum: 0,
          maximum: 12,
          default: 3,
          description: 'Duration of probation period (0-12 months)',
        },
      },
    },
    {
      properties: {
        employmentType: { const: 'part_time' },
        contractType: {
          type: 'string',
          enum: ['hourly_rate', 'fixed_term', 'seasonal'],
          title: 'Contract Type',
          default: 'fixed_term',
          description: 'Type of part-time contract arrangement',
        },
        workingHours: {
          type: 'number',
          title: 'Weekly Working Hours',
          minimum: 1,
          maximum: 40,
          default: 20,
          description: 'Hours per week (1-40)',
        },
      },
    },
    {
      properties: {
        employmentType: { const: 'contractor' },
        contractType: {
          type: 'string',
          enum: ['hourly_rate', 'project_based', 'retainer'],
          title: 'Contract Type',
          default: 'hourly_rate',
          description: 'Type of contractor arrangement',
        },
        workingHours: {
          type: 'number',
          title: 'Weekly Working Hours',
          minimum: 41,
          maximum: 168,
          default: 45,
          description: 'Hours per week (visible for hourly contracts)',
          computed: {
            active: '../contractType === "hourly_rate"',
          },
        },
      },
    },
  ],
};

export default function EmploymentContractDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
