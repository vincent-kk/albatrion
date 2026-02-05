import React from 'react';
import InkSpinner from 'ink-spinner';
import { Text } from './Text.js';

export interface SpinnerProps {
  label?: string;
  type?: 'dots' | 'line' | 'pipe' | 'star' | 'toggle';
}

export const Spinner: React.FC<SpinnerProps> = ({ label, type = 'dots' }) => {
  return (
    <Text color="cyan">
      <InkSpinner type={type} /> {label || ''}
    </Text>
  );
};
