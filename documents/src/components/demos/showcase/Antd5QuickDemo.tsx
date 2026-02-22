import React from 'react';

import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import InputShowcase from '../InputShowcase';

registerPlugin(plugin);

export default function Antd5QuickDemo() {
  return (
    <InputShowcase
      name="FormTypeInputString"
      trigger='type: "string"'
      schema={{ type: 'string', title: 'Text Input' }}
    />
  );
}
