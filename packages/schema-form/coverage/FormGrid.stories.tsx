import React from 'react';

import Form, { type JsonSchema } from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/3. FormGrid',
};

export const Grid = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      email: { type: 'string' },
      password: { type: 'string', formType: 'password' },
      address: { type: 'string' },
      address2: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
    },
  } satisfies JsonSchema;
  const grid = [
    ['email', 'password'],
    [
      {
        element: (
          <div style={{ background: 'yellow', textAlign: 'center' }}>
            - divider -
          </div>
        ),
        grid: 3,
      },
      <div style={{ background: 'orange', textAlign: 'center' }}>
        - - - divider - - -
      </div>,
    ],
    [<h1>address</h1>],
    'address',
    ['address2'],
    [{ name: 'city' }, { name: 'state', grid: 4 }, { name: 'zip', grid: 2 }],
    [
      { name: 'city', grid: 6 },
      { name: 'state', grid: 4 },
      { name: 'zip', grid: 2 },
    ],
    [{ name: 'city', grid: 6 }, { name: 'state', grid: 4 }, { name: 'zip' }],
    [{ name: 'city', grid: 6 }, { name: 'state' }, { name: 'zip' }],
  ];

  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <Form jsonSchema={jsonSchema} gridFrom={grid} />
    </StoryLayout>
  );
};
