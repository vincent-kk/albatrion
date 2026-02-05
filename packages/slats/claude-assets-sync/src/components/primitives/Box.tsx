import React from 'react';
import { Box as InkBox, type BoxProps as InkBoxProps } from 'ink';

export type BoxProps = InkBoxProps;

export const Box: React.FC<BoxProps> = (props) => {
  return <InkBox {...props} />;
};
