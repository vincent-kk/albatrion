/**
 * Replace array template segments with the corresponding live path segments.
 * @param templatePath - Absolute declaration or read path with optional `*` segments
 * @param occurrencePath - Absolute live path supplying the array indices
 * @returns The bound path, or the original string when no segment needs binding
 */
export const bindTemplatePath = (
  templatePath: string, occurrencePath: string,
): string => {
  if (!templatePath.includes('/*')) return templatePath;
  let templateStart = 0;
  let occurrenceStart = 0;
  let copiedThrough = 0;
  let bound = '';
  while (templateStart < templatePath.length) {
    const templateSlash = templatePath.indexOf('/', templateStart + 1);
    const templateEnd = templateSlash < 0 ? templatePath.length : templateSlash;
    const occurrenceSlash = occurrencePath.indexOf('/', occurrenceStart + 1);
    const occurrenceEnd = occurrenceSlash < 0 ? occurrencePath.length : occurrenceSlash;
    if (templatePath.slice(templateStart + 1, templateEnd) === '*' &&
      occurrenceStart < occurrencePath.length) {
      bound += templatePath.slice(copiedThrough, templateStart + 1);
      bound += occurrencePath.slice(occurrenceStart + 1, occurrenceEnd);
      copiedThrough = templateEnd;
    }
    templateStart = templateEnd;
    occurrenceStart = occurrenceEnd;
  }
  return bound ? bound + templatePath.slice(copiedThrough) : templatePath;
};
