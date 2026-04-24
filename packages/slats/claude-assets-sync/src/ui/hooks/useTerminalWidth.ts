import { useEffect, useState } from 'react';
import { useStdout } from 'ink';

import { widths } from '../theme/layout.js';

export function useTerminalWidth(): number {
  const { stdout } = useStdout();
  const [width, setWidth] = useState<number>(
    stdout?.columns ?? widths.idealTerminalWidth,
  );

  useEffect(() => {
    if (!stdout) return;
    const update = () => {
      setWidth(stdout.columns ?? widths.idealTerminalWidth);
    };
    stdout.on('resize', update);
    return () => {
      stdout.off('resize', update);
    };
  }, [stdout]);

  return width;
}
