import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin/2020';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);
registerPlugin(ajv8Plugin);

const schema = {
  type: 'object',
  properties: {
    coordinate: {
      type: 'array',
      title: 'Coordinate [x, y, z]',
      description: '3D point — each position is a number',
      prefixItems: [
        { type: 'number', title: 'X', default: 10 },
        { type: 'number', title: 'Y', default: 20 },
        { type: 'number', title: 'Z', default: 30 },
      ],
      items: false,
      minItems: 3,
    },
    rgb: {
      type: 'array',
      title: 'RGB Color [R, G, B]',
      description: 'Color value — each channel ranges from 0 to 255',
      prefixItems: [
        {
          type: 'number',
          title: 'Red (0-255)',
          default: 66,
          minimum: 0,
          maximum: 255,
        },
        {
          type: 'number',
          title: 'Green (0-255)',
          default: 133,
          minimum: 0,
          maximum: 255,
        },
        {
          type: 'number',
          title: 'Blue (0-255)',
          default: 244,
          minimum: 0,
          maximum: 255,
        },
      ],
      items: false,
      minItems: 3,
    },
    person: {
      type: 'array',
      title: 'Person [name, age, active]',
      description: 'Mixed-type tuple — string, number, boolean',
      prefixItems: [
        { type: 'string', title: 'Name', default: 'Jane' },
        { type: 'number', title: 'Age', default: 28 },
        { type: 'boolean', title: 'Active', default: true },
      ],
      items: false,
      minItems: 3,
    },
    address: {
      type: 'array',
      title: 'Address [street, city, zipcode]',
      description: 'Strict string tuple — no additional items allowed',
      prefixItems: [
        { type: 'string', title: 'Street', default: '123 Main St' },
        { type: 'string', title: 'City', default: 'Seoul' },
        { type: 'string', title: 'Zipcode', default: '06100' },
      ],
      items: false,
      minItems: 3,
    },
  },
};

export default function TupleArraysDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
