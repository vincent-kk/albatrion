/** Read generated Markdown using the contract's independent line/event states.
 * @param document Generated Markdown with supported closed fence/comment contexts.
 * @returns Owned identifiers and their unchanged body bytes in document order.
 * @throws When a generated marker, block, fence or comment boundary is ambiguous.
 */
export function readModelBlocks(
  document: string,
): { blockId: string; body: string }[] {
  const lines: { text: string; ending: string }[] = [];
  let start = 0;
  for (let cursor = 0; cursor < document.length; cursor++) {
    if (document[cursor] !== '\n' && document[cursor] !== '\r') continue;
    const text = document.slice(start, cursor);
    let ending = document[cursor];
    if (ending === '\r' && document[cursor + 1] === '\n')
      ending += document[++cursor];
    lines.push({ text, ending });
    start = cursor + 1;
  }
  if (start < document.length)
    lines.push({ text: document.slice(start), ending: '' });
  const blocks: { blockId: string; body: string }[] = [];
  let pending: { blockId: string; body: string } | undefined;
  let fenceCharacter = '';
  let fenceLength = 0;
  let comment = false;
  let reopened = false;
  const reopensAfter = (tail: string) => {
    const open = tail.lastIndexOf('<!--');
    return open >= 0 && !tail.includes('-->', open + 4);
  };
  for (let number = 0; number < lines.length; number++) {
    const { text, ending } = lines[number];
    let line = text;
    if (number === 0) {
      if (line.charCodeAt(0) === 65279) line = line.slice(1);
      else if (
        [239, 187, 191].every(
          (value, index) => line.charCodeAt(index) === value,
        )
      )
        line = line.slice(3);
    }
    let spaces = 0;
    while (line[spaces] === ' ') spaces++;
    const rest = line.slice(spaces);
    let width = 0;
    while (rest[width] === rest[0] && ['`', '~'].includes(rest[0])) width++;
    if (fenceCharacter) {
      if (
        spaces <= 3 &&
        rest[0] === fenceCharacter &&
        width >= fenceLength &&
        rest.slice(width).trim() === ''
      )
        fenceCharacter = '';
    } else if (comment) {
      if (
        reopened &&
        ((spaces <= 3 && width >= 3) ||
          line.trimStart().startsWith('<!-- AGENTS-ASSETS-SYNC'))
      )
        throw new Error(`reopened:${number + 1}`);
      const close = line.indexOf('-->');
      if (close >= 0) {
        comment = reopensAfter(line.slice(close + 3));
        reopened = comment;
      }
    } else if (spaces <= 3 && width >= 3) {
      fenceCharacter = rest[0];
      fenceLength = width;
    } else {
      let marker = line;
      while (marker.endsWith(' ') || marker.endsWith('\t'))
        marker = marker.slice(0, -1);
      const prefix = '<!-- AGENTS-ASSETS-SYNC:';
      if (marker.startsWith(prefix) && marker.endsWith(' -->')) {
        const tokens = marker.slice(prefix.length, -4).split(':');
        const event = tokens.shift();
        const blockId = tokens.join(':');
        if (!blockId || !['START', 'END'].includes(event ?? ''))
          throw new Error(`marker:${number + 1}`);
        if (event === 'START') {
          if (pending) throw new Error(`nested:${number + 1}`);
          pending = { blockId, body: '' };
        } else {
          if (!pending || pending.blockId !== blockId)
            throw new Error(`unmatched:${number + 1}`);
          blocks.push(pending);
          pending = undefined;
        }
        continue;
      }
      if (line.trimStart().startsWith('<!-- AGENTS-ASSETS-SYNC'))
        throw new Error(`marker:${number + 1}`);
      if (spaces <= 3 && rest.startsWith('<!--')) {
        const close = rest.indexOf('-->', 4);
        reopened = close >= 0 && reopensAfter(rest.slice(close + 3));
        comment = close < 0 || reopened;
      }
    }
    if (pending) pending.body += text + ending;
  }
  if (pending || fenceCharacter || comment)
    throw new Error('incomplete boundary');
  return blocks;
}
