/** Execute the contract as a character machine, preserving every non-boundary byte. */
export function normalizeModel(input: string, stripHeader = true): string {
  const characters = Array.from(input);
  if (stripHeader) {
    if (characters[0]?.codePointAt(0) === 65279) characters.shift();
    else if (
      [239, 187, 191].every(
        (value, index) => characters[index]?.codePointAt(0) === value,
      )
    )
      characters.splice(0, 3);
  }
  let result = '';
  let afterReturn = false;
  for (const character of characters) {
    if (afterReturn && character === '\n') {
      afterReturn = false;
      continue;
    }
    afterReturn = character === '\r';
    result += afterReturn ? '\n' : character;
  }
  return result;
}
