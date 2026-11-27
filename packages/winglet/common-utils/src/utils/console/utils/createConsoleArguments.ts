import type { PrintConsoleOptions } from '../type';

/**
 * Keep user text in substitution arguments, preserving style and details ordering.
 * @param title Title text, including any literal percent signs.
 * @param message Message lines to print verbatim.
 * @param options Optional presentation and structured details.
 * @param titleColor Default title color when options omit it.
 * @param messageColor Default line color when options omit it.
 * @returns Console format followed by alternating style and text arguments, then details.
 */
export function createConsoleArguments(title: string, message: readonly string[], options: PrintConsoleOptions | undefined, titleColor: string, messageColor: string): [string, ...unknown[]] {
  const emoji = options?.emoji || '⚠️';
  const args: [string, ...unknown[]] = [
    '%c%s\n\n%c%s\n\n', 'color: #666;', options?.info || '',
    `color: ${options?.titleColor || titleColor}; font-weight: bold; font-size: 1.25em;`,
    ` ${emoji} ${title} ${emoji} `,
  ];
  const color = `color: ${options?.messageColor || messageColor}`;
  for (let index = 0; index < message.length; index++) {
    args[0] += '%c%s\n';
    args.push(color, `  ${message[index]}`);
  }
  if (options?.details !== undefined) args.push(options.details);
  return args;
}
