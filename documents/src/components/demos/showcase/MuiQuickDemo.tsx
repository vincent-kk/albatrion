import React from 'react';

import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

import InputShowcase from '../InputShowcase';

registerPlugin(plugin);

export default function MuiQuickDemo() {
  return (
    <InputShowcase
      name="FormTypeInputString"
      trigger='type: "string"'
      schema={{ type: 'string', title: 'Text Input' }}
    />
  );
}
