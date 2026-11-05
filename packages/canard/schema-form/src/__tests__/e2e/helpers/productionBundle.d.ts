/** Rolldown's runtime bundle exposes these public package symbols to the production test. */
declare module '*dist/index.mjs' {
  export {
    Form,
    type FormHandle,
    type JSONSchema,
    VirtualizationBackfill,
    registerPlugin,
  } from '@/schema-form';
}
