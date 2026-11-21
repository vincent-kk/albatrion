import type { ReactNode } from 'react';

import { getOwnLabel } from './getOwnLabel';

/**
 * Builds library options from a schema enum.
 * @param values - JSON scalar choices in schema order.
 * @param aliases - Optional display aliases.
 * @returns Choices with their JSON tokens, labels, and raw values.
 */
export const getEnumOptions = <T extends string | number | null>(
  values: readonly T[] | undefined,
  aliases: Record<string, ReactNode> | undefined,
) =>
  values?.map((rawValue) => {
    const label = String(rawValue);
    return {
      rawValue,
      value: JSON.stringify(rawValue),
      label: getOwnLabel(aliases, label) || label,
    };
  }) ?? [];
