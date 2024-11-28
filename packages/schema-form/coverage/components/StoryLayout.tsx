import React, { type PropsWithChildren } from 'react';

import { JsonSchema } from '../../src';

const StoryLayout = ({
  children,
  jsonSchema,
  value,
  errors,
}: PropsWithChildren<{
  jsonSchema: JsonSchema;
  value?: any;
  errors?: any[];
}>) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 5,
        justifyContent: 'start',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', gap: 10, justifyContent: 'start' }}>
        <fieldset style={{ flex: 1 }}>
          <legend>Form</legend>
          {children}
        </fieldset>

        <fieldset style={{ flex: 1 }}>
          <legend>Value</legend>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </fieldset>

        <fieldset style={{ flex: 1 }}>
          <legend>Errors</legend>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </fieldset>
      </div>
      <fieldset>
        <legend>Schema</legend>
        <pre>{JSON.stringify(jsonSchema, null, 2)}</pre>
      </fieldset>
    </div>
  );
};

export default StoryLayout;
