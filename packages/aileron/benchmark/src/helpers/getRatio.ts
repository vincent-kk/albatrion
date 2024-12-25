import type { Suite } from 'benchmark';

export type Ratio = {
  fastest: string;
  slowest: string;
  speedRatio: string;
  executionTimeSaved: string;
};

export const getRatio = (suite: Suite): Ratio => {
  const fastest = (suite.filter('fastest') as any)[0].hz as number;
  const slowest = (suite.filter('slowest') as any)[0].hz as number;
  const speedRatio = fastest / slowest;
  const executionTimeSaved = (1 - slowest / fastest) * 100;
  return {
    fastest: fastest.toFixed(2),
    slowest: slowest.toFixed(2),
    speedRatio: speedRatio.toFixed(2),
    executionTimeSaved: executionTimeSaved.toFixed(2),
  };
};
