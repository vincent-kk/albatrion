/** Validator keywords expected on each JSON Pointer; an empty list means the node holds no issue. */
export type KeywordsByPath = Readonly<Record<string, readonly string[]>>;

/** Form-level validation mode named without the engine enum, mapped by each consumer. */
export type ValidationModeName = 'OnChange' | 'OnRequest' | 'None';

/** Error display policy named without the engine enum, mapped by each consumer. */
export type ShowErrorName = 'Always' | 'Never' | 'Edited' | 'Touched' | 'EditedTouched';

/** Interaction state flags named without the engine enum; a key is present only while some node holds it. */
export type InteractionStateNames = Readonly<Partial<Record<'edited' | 'touched' | 'showError', true>>>;
