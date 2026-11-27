/**
 * Render authored prose whose backtick spans name code, as story JSDoc descriptions write them.
 * @param props - Plain text; text between a pair of backticks becomes inline code.
 * @returns Text nodes and code elements in their authored order.
 */
export function InlineText({ text }: { text: string }) {
  return <>{text.split('`').map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))}</>;
}
