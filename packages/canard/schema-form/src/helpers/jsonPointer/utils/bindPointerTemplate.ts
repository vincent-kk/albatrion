import { JSONPointer as $ } from '../constants/JSONPointer';
import { PointerOperator } from '../constants/PointerOperator';
import { hasPointerOperator } from './hasPointerOperator';

/**
 * Replace each wildcard segment of a template address with the matching segment of a concrete occurrence.
 * @param templatePath - Canonical template address that may contain exact `*` segments.
 * @param occurrencePath - Concrete address aligned segment by segment with the template.
 * @returns The same template string when it has no wildcard or the occurrence is shorter than the wildcard's depth; otherwise the bound address.
 */
export const bindPointerTemplate = (
  templatePath: string,
  occurrencePath: string,
): string => {
  if (!hasPointerOperator(templatePath, PointerOperator.Wildcard))
    return templatePath;
  let templateStart = 0;
  let occurrenceStart = 0;
  let copiedThrough = 0;
  let bound: string = $.Root;
  while (templateStart < templatePath.length) {
    const templateSlash = templatePath.indexOf($.Separator, templateStart + 1);
    const templateEnd = templateSlash < 0 ? templatePath.length : templateSlash;
    const occurrenceSlash = occurrencePath.indexOf(
      $.Separator,
      occurrenceStart + 1,
    );
    const occurrenceEnd =
      occurrenceSlash < 0 ? occurrencePath.length : occurrenceSlash;
    if (
      templateEnd === templateStart + 2 &&
      templatePath[templateStart + 1] === $.Wildcard &&
      occurrenceStart < occurrencePath.length
    ) {
      bound += templatePath.slice(copiedThrough, templateStart + 1);
      bound += occurrencePath.slice(occurrenceStart + 1, occurrenceEnd);
      copiedThrough = templateEnd;
    }
    templateStart = templateEnd;
    occurrenceStart = occurrenceEnd;
  }
  return bound ? bound + templatePath.slice(copiedThrough) : templatePath;
};
