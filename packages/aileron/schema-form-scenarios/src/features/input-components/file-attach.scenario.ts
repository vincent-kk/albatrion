import type { FormScenario } from '../../types';

/** A single-file field and a multi-file field that a toggle can deactivate. */
const uploadSchema = {
  type: 'object',
  properties: {
    avatar: { type: 'string', presentation: { formType: 'input-components.file' } },
    showGallery: { type: 'boolean' },
    gallery: { type: 'array', items: { type: 'string' }, presentation: { formType: 'input-components.files' }, controls: { active: '../showGallery' } },
  },
};

/** Attached files live in the handle's map by path and leave it when their input unmounts or the form resets. */
export const fileAttachScenario: FormScenario = {
  name: 'input-components.file-attach',
  description: 'onFileAttach stores files by node path in the attached files map, wrapping one file in a list; an input that unmounts (here through active false, LANDING-148) removes its entry, and reset clears the map (TEST-020, TEST-023). Stages come from fileAttachStages.',
  schema: uploadSchema,
  initialValue: { showGallery: true },
  steps: [{ action: 'batch', steps: [], expect: { shape: { '/avatar': 'present', '/gallery': 'present' } } }],
};

/** One consumer action and the attached file names by path afterwards. */
export interface FileAttachStage {
  /** Upload files into a field, toggle the gallery, or reset the form. */
  readonly act: 'upload' | 'hideGallery' | 'reset';
  /** Field the upload targets. */
  readonly path?: string;
  /** File names uploaded; the consumer creates the File objects. */
  readonly fileNames?: readonly string[];
  /** Attached file names by path afterwards; a missing path has no entry. */
  readonly attached: Readonly<Record<string, readonly string[]>>;
}

/** Actions applied in order to fileAttachScenario. */
export const fileAttachStages: readonly FileAttachStage[] = [
  { act: 'upload', path: '/avatar', fileNames: ['me.png'], attached: { '/avatar': ['me.png'] } },
  { act: 'upload', path: '/gallery', fileNames: ['a.png', 'b.png'], attached: { '/avatar': ['me.png'], '/gallery': ['a.png', 'b.png'] } },
  { act: 'hideGallery', attached: { '/avatar': ['me.png'] } },
  { act: 'reset', attached: {} },
];
