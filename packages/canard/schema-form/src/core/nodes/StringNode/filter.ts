import { isSchemaNode } from '../filter';
import type { StringNode } from './StringNode';

/**
 * Type guard to check if a node represents a string schema type.
 *
 * Identifies nodes that handle text values with support for patterns,
 * formats, and length constraints according to JSON Schema specification.
 *
 * @param input - The value to check
 * @returns Whether the input is a StringNode
 *
 * @example
 * String field with format-specific rendering:
 * ```tsx
 * function StringFieldRenderer({ node }: { node: SchemaNode }) {
 *   if (!isStringNode(node)) return null;
 *
 *   const { format, pattern, minLength, maxLength } = node.jsonSchema;
 *
 *   // Render different inputs based on format
 *   switch (format) {
 *     case 'email':
 *       return <EmailInput node={node} />;
 *     case 'date':
 *       return <DatePicker node={node} />;
 *     case 'uri':
 *       return <UrlInput node={node} />;
 *     case 'password':
 *       return <PasswordInput node={node} minLength={minLength} />;
 *     default:
 *       return (
 *         <TextInput
 *           node={node}
 *           pattern={pattern}
 *           maxLength={maxLength}
 *         />
 *       );
 *   }
 * }
 * ```
 *
 * @example
 * String content analysis:
 * ```typescript
 * function analyzeStringNodes(root: SchemaNode): StringAnalysis {
 *   const analysis: StringAnalysis = {
 *     totalStrings: 0,
 *     emptyStrings: 0,
 *     averageLength: 0,
 *     formats: new Set<string>()
 *   };
 *
 *   function traverse(node: SchemaNode) {
 *     if (isStringNode(node)) {
 *       analysis.totalStrings++;
 *
 *       if (node.value === '') {
 *         analysis.emptyStrings++;
 *       }
 *
 *       if (typeof node.value === 'string') {
 *         analysis.averageLength += node.value.length;
 *       }
 *
 *       if (node.jsonSchema.format) {
 *         analysis.formats.add(node.jsonSchema.format);
 *       }
 *     }
 *
 *     if (isBranchNode(node) && node.children) {
 *       node.children.forEach(child => traverse(child.node));
 *     }
 *   }
 *
 *   traverse(root);
 *
 *   if (analysis.totalStrings > 0) {
 *     analysis.averageLength /= analysis.totalStrings;
 *   }
 *
 *   return analysis;
 * }
 * ```
 */
export const isStringNode = (input: any): input is StringNode =>
  isSchemaNode(input) && input.type === 'string';
