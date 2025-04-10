import { map } from '@/common-utils/utils/array';

export const printError = (
  title: string,
  message: string[],
  options?: {
    info?: string;
    emoji?: string;
    titleColor?: `#${string}`;
    messageColor?: `#${string}`;
  },
) =>
  console.error(
    `%c${options?.info || ''}\n\n` +
      `%c ${options?.emoji || '⚠️'} ${title} ${options?.emoji || '⚠️'} \n\n` +
      map(message, (line: string) => `%c  ${line}\n`).join(''),
    'color: #666;',
    `color: ${options?.titleColor || '#ff0000'}; font-weight: bold; font-size: 1.25em;`,
    ...map(message, () => `color: ${options?.messageColor || '#ff6b6b'}`),
  );
