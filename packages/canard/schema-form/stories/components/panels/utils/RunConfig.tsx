import { isArray } from '@winglet/common-utils/filter';

import { toDisplayJSON } from '../toDisplayJSON';
import { useStoryPanelsSnapshot } from './useStoryPanelsSnapshot';

/** Longer values only name themselves; the Settings panel shows them in full. */
const CHIP_VALUE_LIMIT = 48;

/**
 * Show the settings that decide how the story's form behaves, so readers interpret results correctly.
 * Subscribes on its own so the header around it never rerenders.
 * @returns Chips for validation mode, error visibility and validator, plus every non-default
 * option the renderer reported: virtualization, FormProvider, context, fieldInputMap keys and prop stages.
 */
export function RunConfig() {
  const { settings, stage } = useStoryPanelsSnapshot();
  const chips: [string, string][] = [];
  if (settings.validationMode !== undefined) chips.push(['validationMode', String(settings.validationMode)]);
  if (settings.errorVisibility !== undefined) chips.push(['errorVisibility', String(settings.errorVisibility)]);
  if (settings.validator !== undefined) chips.push(['validator', String(settings.validator)]);
  if (settings.virtualization) chips.push(['virtualization', toDisplayJSON(settings.virtualization, 0)]);
  if (settings.FormProvider) chips.push(['FormProvider', 'on']);
  if (settings.context !== undefined) {
    const context = toDisplayJSON(settings.context, 0);
    chips.push(['context', context.length > CHIP_VALUE_LIMIT ? 'set (see Settings)' : context]);
  }
  const inputMap = settings.fieldInputMap;
  if (isArray(inputMap) && inputMap.length) chips.push(['fieldInputMap', inputMap.join(', ')]);
  if (stage.total > 1) chips.push(['props stage', `${stage.current} of ${stage.total}`]);
  if (!chips.length) return null;
  return <ul className="sf-chips" aria-label="Run configuration">
    {chips.map(([key, value]) => <li key={key} className="sf-chip"><span className="sf-chip-key">{key}</span><span className="sf-chip-value">{value}</span></li>)}
  </ul>;
}
