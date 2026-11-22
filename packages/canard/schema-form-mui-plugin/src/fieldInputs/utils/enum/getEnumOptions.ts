import type { ReactNode } from 'react';

import { getOwnLabel } from './getOwnLabel';

/**
 * Builds library options from a schema enum.
 * @param values - JSON scalar choices in schema order.
 * @param aliases - Optional display aliases.
 * @param getInputId - Optional core resolver for individually addressed options.
 * @param positionalLabels - Optional labels in schema order, ahead of aliases.
 * @returns Choices with their JSON tokens, labels, and raw values.
 */
export const getEnumOptions = <T extends string | number | null>(
  values: readonly T[] | undefined,
  aliases: Record<string, ReactNode> | undefined,
  getInputId?: (key: number) => string,
  positionalLabels?: readonly ReactNode[],
) =>
  values?.map((rawValue, index) => {
    const label = String(rawValue);
    return {
      id: getInputId?.(index),
      rawValue,
      value: JSON.stringify(rawValue),
      label: positionalLabels?.[index] || getOwnLabel(aliases, label) || label,
    };
  }) ?? [];
