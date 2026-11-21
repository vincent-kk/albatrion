/**
 * Compute a name from the labels and metadata authored in a fixture.
 * @param labels - In-order visible text and schema fallback candidates.
 * @returns The text a field control or composite announces.
 */
export const fieldNameReference = (labels: {
  visible: readonly string[];
  title?: string;
  ariaLabel?: string;
  key: string;
}): string => {
  const normalized = (value: string) => value.trim().split(/\s+/).join(' ');
  const visible = [...new Set(labels.visible.map(normalized).filter(Boolean))];
  return (
    visible.join(' ') ||
    [labels.ariaLabel, labels.title, labels.key]
      .find((value) => value?.trim())
      ?.trim() ||
    ''
  );
};
