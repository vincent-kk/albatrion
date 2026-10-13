/**
 * Apply the 259C-01 SchemaNode → FieldNode rename to a path or source text from a revision that predates it.
 * A pure rename keeps behavior, so a pinned revision renamed this way binds to working-tree helpers by today's names.
 * @param text - Repository-relative path or TypeScript source from the pinned revision
 * @returns The same text with every old name and path written in the current form
 */
export const renameFieldNodeNames = (text: string): string =>
  text
    .replace(/DeferrableNodeProxy/g, 'DeferredFieldProxy')
    .replace(/components\/SchemaNode(?=[/'"`\s.,):]|$)/gm, 'components/Field')
    .replace(
      /[A-Za-z0-9_$]*(?:SchemaNode|schemaNode)[A-Za-z0-9_$]*/g,
      (token) =>
        token
          .replace(/SchemaNodeProxy/g, 'FieldProxy')
          .replace(/^SchemaNodeInput/, 'FieldInputSlot')
          .replace(/SchemaNode/g, 'FieldNode')
          .replace(/schemaNode/g, 'fieldNode'),
    );
