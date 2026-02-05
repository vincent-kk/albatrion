import React from 'react';
import { Text as InkText, type TextProps as InkTextProps } from 'ink';

export type TextProps = InkTextProps;

export const Text: React.FC<TextProps> = (props) => {
  return <InkText {...props} />;
};
