import type { OrderedKeywordDescriptor } from '../../../../../../../vocabulary/type';
import type { SchemaEntry } from '../../../../../../type';

/**
 * Capture list and tuple elements in index order, excluding holes and array-valued schemas.
 * @param entries Stack receiving fresh entries for accepted elements.
 * @param nodes Validated applicator array.
 * @param descriptor Compiled keyword and escaped path token.
 * @param parentPath Captured parent schema path.
 * @param parentDataPath Captured parent data path.
 * @param depth Captured child depth.
 * @param contributesDataPath Whether tuple indices also address user data.
 * @param inert Inherited or keyword-level inertness, including unsupported tuple forms.
 * @param booleanInert Whether the dialect predates boolean schemas.
 * @param visitBooleans Whether callbacks can observe boolean leaves.
 * @returns Nothing; original indices are retained as numeric variants.
 */
export function appendListChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  nodes: unknown[],
  descriptor: OrderedKeywordDescriptor,
  parentPath: string,
  parentDataPath: string,
  depth: number,
  contributesDataPath: boolean,
  inert: boolean,
  booleanInert: boolean,
  visitBooleans: boolean,
): void {
  const path = parentPath + '/' + descriptor.path + '/';
  const dataPath = contributesDataPath ? parentDataPath + '/' : parentDataPath;
  const keyword = descriptor.keyword;
  for (let i = 0, length = nodes.length; i < length; i++) {
    const schema = nodes[i];
    if (
      !(
        (schema !== null &&
          typeof schema === 'object' &&
          !Array.isArray(schema)) ||
        (visitBooleans && typeof schema === 'boolean')
      )
    )
      continue;
    const child = {
      schema,
      path: path + i,
      keyword,
      variant: i,
      dataPath: contributesDataPath ? dataPath + i : dataPath,
      depth,
    } as Entry;
    if (inert || (booleanInert && typeof schema === 'boolean'))
      child.inert = true;
    entries.push(child);
  }
}
