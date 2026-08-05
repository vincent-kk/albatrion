export const colors = {
  primary: 'cyan',
  success: 'green',
  warn: 'yellow',
  danger: 'red',
  muted: 'gray',
  accent: 'magenta',
  info: 'blue',
  dim: 'gray',
} as const;

export const gradientStops = ['#22d3ee', '#a78bfa', '#f59e0b'] as const;

export type ColorName = (typeof colors)[keyof typeof colors];
