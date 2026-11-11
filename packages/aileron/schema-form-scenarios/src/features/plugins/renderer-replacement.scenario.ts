import type { FormScenario } from "../../types";

/** A bounded text field and a number, drawn by consumer renderers. */
const rendererSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 2 },
    count: { type: "number" },
  },
};

/** Form renderer props replace the plugin's renderers; a FormProvider group renderer applies when the Form sets none. */
export const rendererReplacementScenario: FormScenario = {
  name: "plugins.renderer-replacement",
  description:
    'SURFACE-002 and LANDING-035 the four renderers FieldRenderer, LabelRenderer, InputRenderer and ErrorMessageRenderer are Form props with the plugin key names; a Form renderer replaces the plugin one for that slot, and a FormProvider group renderer applies when the Form sets none; SURFACE-003 Form.Label, Form.ErrorMessage and the default group use the registered label and error renderers with node and children. Renderer cases come from rendererCases; each consumer renderer marks itself with data-renderer="<source>-<slot>".',
  schema: rendererSchema,
  initialValue: { title: "a", count: 1 },
  steps: [
    {
      action: "setValue",
      path: "/count",
      value: 2,
      expect: {
        values: { "/count": 2 },
        errors: { "/title": [{ keyword: "minLength" }] },
      },
    },
  ],
};

/** Renderer slots a case sets on the Form or the FormProvider. */
export type RendererSlot = "group" | "label" | "error";

/** One placement of consumer renderers and the markers drawn in the form. */
export interface RendererCase {
  /** Story and test label. */
  readonly label: string;
  /** Slots set as Form props, drawn with the marker prefix "form". */
  readonly form: readonly RendererSlot[];
  /** Slots set on the FormProvider, drawn with the marker prefix "provider". */
  readonly provider: readonly RendererSlot[];
  /** Whether /title is drawn by a children layout of Form.Label, Form.Input and Form.ErrorMessage instead of Form.Field. */
  readonly composed: boolean;
  /** Markers drawn in the form once errors show. */
  readonly markers: readonly string[];
  /** Markers that must not appear anywhere. */
  readonly absent: readonly string[];
}

/** Placements compared on rendererReplacementScenario with errorVisibility on. */
export const rendererCases: readonly RendererCase[] = [
  {
    label: "form label and error",
    form: ["label", "error"],
    provider: [],
    composed: true,
    markers: ["form-label", "form-error"],
    absent: [],
  },
  {
    label: "form parts in default group",
    form: ["label", "error"],
    provider: [],
    composed: false,
    markers: ["form-label", "form-error"],
    absent: [],
  },
  {
    label: "provider parts in default group",
    form: [],
    provider: ["label", "error"],
    composed: false,
    markers: ["provider-label", "provider-error"],
    absent: [],
  },
  {
    label: "provider group",
    form: [],
    provider: ["group"],
    composed: false,
    markers: ["provider-group"],
    absent: [],
  },
  {
    label: "form group over provider group",
    form: ["group"],
    provider: ["group"],
    composed: false,
    markers: ["form-group"],
    absent: ["provider-group"],
  },
];
