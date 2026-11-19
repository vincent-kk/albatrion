/** Expected opaque encoding for incidental id assertions; never used by product code. */
export const expectedFieldPartId = (inputId: string, part: string): string =>
  part === 'label'
    ? inputId.replace(/~input$/, '~label')
    : inputId + '.' + part.slice('option:'.length);
