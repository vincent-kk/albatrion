# @canard/schema-form-antd-mobile-plugin: bug bounty round 6

1 new finding in `@canard/schema-form-antd-mobile-plugin`: 1 low. Items in the documents of [round 1](../round-1/canard-schema-form-antd-mobile-plugin.md), [round 2](../round-2/canard-schema-form-antd-mobile-plugin.md), [round 3](../round-3/canard-schema-form-antd-mobile-plugin.md), [round 4](../round-4/canard-schema-form-antd-mobile-plugin.md), and [round 5](../round-5/canard-schema-form-antd-mobile-plugin.md) are treated as fixed and excluded, together with their recorded decisions and known limits. The main session re-runs every probe: `r6-ui-sliders` runs 9 tests, of which 1 fails. Its `r6-rerun-packages` re-run for this package runs 122 tests, of which 9 fail, using the default configurations, including for round 4 folders.

Probes: [probes/canard-schema-form-antd-mobile-plugin/](probes/canard-schema-form-antd-mobile-plugin/)

- Copy `probes/canard-schema-form-antd-mobile-plugin/r6-ui-sliders/` back to `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r6-ui-sliders/` and run `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/r6-ui-sliders/`. These public `Form` probes import the plugin source entry and the built core entry, and run with the installed component library on React 19 in jsdom. The hunter's freshness check finds no non-probe source newer than the built core or plugin entry. No historical package build runs.
- Every failing `r6-ui-sliders` test belongs to an item below; the remaining 8 tests pass. Earlier retained probes run with `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/r6-rerun-packages/ --testTimeout=120000 --maxWorkers=2`. Their files remain in the earlier rounds; this package has no new `r6-rerun-packages` copy in the round 6 probe directory.
- Earlier failures are not findings: `r1-legacy/readOnly.test.tsx` retains the indeterminate-checkbox documentation decision, and `r3-r3-ui-plugins/readmeExample.test.tsx` retains the slider-mark documentation decision. `r3-r3-ui-plugins/sliderFocus.test.tsx`, `r4-r4-ui-mui-mobile/coreBuildCheck.test.tsx`, and `optionIdentifiers.test.tsx` use the replaced identifier interface; the current ports pass.
- `r4-r4-ui-mui-mobile/sliderValues.test.tsx` sends keydown without the key release required by default lazy commits. The multiple-enum row in `r5-r5-ids/formLabelTargets.test.tsx` is a rejected hypothesis because the array schema selects a composite input. `r5-r5-release/stepperPeerFloor.test.tsx` emulates versions 5.0 and 5.1, outside the supported 5.2 floor.

Root-cause files: `packages/canard/schema-form-antd-mobile-plugin/src/`.

## 1. Switching an editable slider to read-only displays a rounded value instead of its stored decimal.

- Severity: low. A review-mode transition displays `2` for the valid stored value `2.4`; the stored value remains intact.
- Affected public API: `FieldInputSliderDefinition`, public `Form.readOnly`, and a number schema with `minimum: 0`, `maximum: 10`, no `multipleOf`, and stored value `2.4`.
- Contract violated: `packages/canard/schema-form-antd-mobile-plugin/src/DETAIL.md:17` preserves valid ungridded read-only values. The same final read-only state must display the same value after a transition and a direct mount; `../round-5/FIXES.md:199`, `:408`, and `:508` record the decimal-preservation decision.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:104-116` chooses the editable snapped draft or read-only stored value only during state initialization. Changing `readOnly` locks the widget without recomputing its draft from the stored decimal.
- Relation to earlier rounds: same class as the read-only decimal follow-up in `../round-5/FIXES.md:199`, with a lifecycle transition rather than a direct mount. Each plugin owns its copied implementation and records its own item.
- Reopens an earlier fix: the [round 5 slider follow-up](../round-5/FIXES.md) at line 199, `2182e4c4d` and `16f3ba679`.
- Regression of an earlier fix: yes, case (b) of `16f3ba679`, by reading only for this package. The parent initializes through `bounds.initialValue(initial)`, preserving the in-range ungridded decimal; the commit snaps the editable draft to `2` and retains it after locking. The same commit changes the mobile implementation, but the archived-source execution covers only antd5, antd6, and Material UI, not mobile.
- Watch list: yes; sliders, labels, and control identifiers across the core and four interface plugins.
- Reproduction: `r6-ui-sliders/lifecycle.test.tsx`, “read-only transition shows the same valid decimal as a read-only mount”, gives `aria-valuenow="2"` after `readOnly=false` becomes `true`, versus `"2.4"` on a direct read-only mount; both must be `"2.4"`. `getValue()` remains `{ level: 2.4 }`. Run `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/r6-ui-sliders/lifecycle.test.tsx`. Editable or disabled normalization remains the permitted behavior of `../round-5/FIXES.md:537`; only the final read-only display is reported.
- Confidence: high for the current lifecycle difference; public interface with the installed component library, with historical attribution claimed by reading.

## Hypotheses checked and not bugs

- Combined inclusive and exclusive decimal bounds, negative bounds, exponent steps with two exclusive endpoints, and narrow inclusive ranges select valid Home and End values in immediate and lazy mode.
- A navigation key released while read-only does not publish its pending value. Direct read-only decimal mounts preserve the valid decimal; the reported failure requires a transition.
- Current identifier and external-write ports, focused slider constraints, custom layout names, and accessible-definition checks pass. The retained earlier failures above do not establish a new defect.
- `r6-ui-sliders/rangeMarks.test.tsx` checks a two-thumb range with item-level exponent steps and exclusive bounds: invalid endpoint marks are filtered, thumb identifiers remain distinct, and both lazy settings commit `[2e-7, 8e-7]`.

## Open leads

- The mobile introducing-commit attribution remains based on reading only; no historical mobile execution runs. Full Cartesian slider models and real old-peer installations are outside this audit; focused specification cases pass.
