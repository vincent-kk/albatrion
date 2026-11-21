/**
 * State the expected spelling for incidental identifier assertions only.
 * @param inputId - Primary id observed by the test; no DOM id is assigned here.
 * @param part - The asserted label role or an option:index role.
 * @returns The expected test value; product code never imports this oracle.
 */
export const expectedFieldPartId = (inputId: string, part: string): string =>
  part === 'label'
    ? inputId.replace(/~input$/, '~label')
    : inputId + '.' + part.slice('option:'.length);
