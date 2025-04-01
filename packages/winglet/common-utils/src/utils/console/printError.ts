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
      message.map((line) => `%c  ${line}\n`).join(''),
    'color: #666;',
    `color: ${options?.titleColor || '#ff0000'}; font-weight: bold; font-size: 1.25em;`,
    ...message.map(() => `color: ${options?.messageColor || '#ff6b6b'}`),
  );
