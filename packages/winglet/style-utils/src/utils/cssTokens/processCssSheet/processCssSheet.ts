import { CssFrame } from '../CssFrame';
import { CssContext } from '../CssContext';
import { CssTokenKind } from '../CssTokenKind';
import { getCssBlockContext } from '../getCssBlockContext';
import { getCssEofSuffix } from '../getCssEofSuffix';
import { getCssSignificantIndex } from '../getCssSignificantIndex';
import { getSimpleDeclarationEnd } from '../getSimpleDeclarationEnd';
import { getSimpleRuleEnd } from '../getSimpleRuleEnd';
import { hasCssName } from '../hasCssName';
import { readCssSheetToken } from '../readCssSheetToken';
import { canDropCssComment } from './utils/canDropCssComment';
import { keepCssWhitespace } from './utils/keepCssWhitespace';

/**
 * Process CSS grammar and token positions once for compression and optional fragment EOF recovery.
 * @param input One sheet; preparation modes normalize its leading BOM
 * @param compressed Whether to remove irrelevant whitespace, comments and declaration semicolons
 * @param mode Public compression, shadow EOF, or the document scoper's open-block policy
 * @returns The processed text without a separate closing scan
 */
export const processCssSheet = (input: string, compressed: boolean, mode: 'none' | 'shadow' | 'document'): string => {
  const css = mode !== 'none' && input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  if (!css) return '';
  const batchDeclarations = css.length >= 256;
  let context: number = CssContext.RuleList, components = 0, valueEmpty = true, custom = false;
  let safeEnd = 0, atParent: CssContext = CssContext.RuleList, atStart = 0;
  let declarationStart = 0, declarationOutput = 0;
  let rootFrame = 0;
  let stack: number[] | undefined;
  let output = '', index = 0, segmentStart = 0, previousCode = 0, previousEnd = 0;
  let previousKind = CssTokenKind.Delimiter, hasOutput = false, lastKind = previousKind, lastStart = 0;
  while (index < css.length) {
    const ruleEnd = batchDeclarations && context === CssContext.RuleList && components === 0 ? getSimpleRuleEnd(css, index) : 0;
    if (ruleEnd) {
      index = ruleEnd; previousCode = 125; previousKind = CssTokenKind.Delimiter;
      previousEnd = ruleEnd; hasOutput = true; lastKind = previousKind; lastStart = ruleEnd - 1;
      if (rootFrame === 0) safeEnd = output.length + ruleEnd - segmentStart;
      continue;
    }
    const firstCode = css.charCodeAt(index);
    const declarationEnd = batchDeclarations && context === CssContext.DeclarationList && components === 0 ? getSimpleDeclarationEnd(css, index) : 0;
    const token = declarationEnd ? declarationEnd * 16 : readCssSheetToken(css, index), kind = token % 16, end = Math.floor(token / 16), code = declarationEnd ? css.charCodeAt(end - 1) : firstCode;
    lastKind = kind; lastStart = declarationEnd ? end - 1 : index;
    if (kind === CssTokenKind.Comment || kind === CssTokenKind.OpenComment) {
      if (compressed) {
        output += css.slice(segmentStart, index); segmentStart = end;
        if (hasOutput && end < css.length) {
          const next = readCssSheetToken(css, end);
          if (!canDropCssComment(previousKind, previousCode, next % 16, css.charCodeAt(end))) output += '/**/';
        }
      }
      index = end; continue;
    }
    if (kind === CssTokenKind.Whitespace) {
      if (compressed) {
        output += css.slice(segmentStart, index); segmentStart = end;
        if (previousKind === CssTokenKind.Delimiter && previousCode === 92 && (code === 10 || code === 13 || code === 12)) {
          output += code === 13 && css.charCodeAt(index + 1) === 10 ? '\r\n' : css[index];
          previousCode = 32; previousKind = CssTokenKind.Whitespace;
        } else if (hasOutput && (end < css.length || (context === CssContext.Value && valueEmpty) || (previousCode === 58 && (context === CssContext.AtPrelude || context === CssContext.OpaquePrelude)))) {
          const next = end < css.length ? css.charCodeAt(end) : -1;
          if (keepCssWhitespace(css, context, components, valueEmpty, custom, previousCode, next, previousEnd)) {
            if (previousKind !== CssTokenKind.Whitespace) output += ' ';
            previousCode = 32; previousKind = CssTokenKind.Whitespace;
          }
        }
      }
      index = end; continue;
    }
    const removableSemicolon = kind === CssTokenKind.Delimiter && code === 59 && components === 0 && context !== CssContext.AtPrelude && context !== CssContext.OpaquePrelude;
    const marker = kind === CssTokenKind.Delimiter && ((code === 60 && end - index === 4) || (code === 45 && end - index === 3 && css.startsWith('-->', index)));
    if (marker && context === CssContext.RuleList && rootFrame === 0) {
      if (mode !== 'none') { output += css.slice(segmentStart, index); segmentStart = end; index = end; continue; }
    } else {
      if (context === CssContext.RuleList) {
        context = kind === CssTokenKind.AtKeyword ? CssContext.AtPrelude : CssContext.Selector;
        atParent = CssContext.RuleList;
        if (kind === CssTokenKind.AtKeyword) atStart = index;
      } else if (context === CssContext.DeclarationList) {
        declarationStart = index; declarationOutput = output.length + index - segmentStart;
        custom = (firstCode === 45 && css.charCodeAt(index + 1) === 45) || ((firstCode === 92 || css.charCodeAt(index + 1) === 92) && hasCssName(css, index, end, '--', false));
        context = kind === CssTokenKind.AtKeyword ? CssContext.AtPrelude : CssContext.DeclarationName;
        atParent = CssContext.DeclarationList;
        if (kind === CssTokenKind.AtKeyword) atStart = index;
      }
      if (context === CssContext.Value) valueEmpty = false;
      if (kind === CssTokenKind.Function || (kind === CssTokenKind.Delimiter && (end - index === 1 || declarationEnd !== 0))) {
        if (kind === CssTokenKind.Function || code === 40 || code === 91) {
          const close = kind === CssTokenKind.Function || code === 40 ? 41 : 93;
          const frame = (context << CssFrame.ContextShift) | close;
          if (rootFrame === 0) rootFrame = frame;
          else (stack ??= []).push(frame);
          components++;
          if (code === 91 && context === CssContext.Selector) context = CssContext.OpaquePrelude;
          if (kind === CssTokenKind.Function && context === CssContext.AtPrelude) context = hasCssName(css, index, end - 1, 'selector') ? CssContext.Selector : CssContext.OpaquePrelude;
        } else if (code === 123) {
          const selector: boolean = components === 0 && context === CssContext.Value && !custom;
          const block: boolean = components === 0 && context !== CssContext.OpaquePrelude && (context !== CssContext.Value || selector);
          const parent: CssContext = selector ? CssContext.DeclarationList : block ? context === CssContext.Selector ? CssContext.RuleList : context === CssContext.AtPrelude ? atParent : CssContext.DeclarationList : context;
          const frame = (parent << CssFrame.ContextShift) | 125 | (block ? CssFrame.RuleBlock : 0);
          if (rootFrame === 0) rootFrame = frame;
          else (stack ??= []).push(frame);
          if (!block) components++;
          else context = context === CssContext.AtPrelude ? getCssBlockContext(css, atStart, parent) : CssContext.DeclarationList;
          if (selector) {
            output = (output + css.slice(segmentStart, index)).slice(0, declarationOutput) + css.slice(declarationStart, index);
            segmentStart = index;
          }
        } else if (code === 41 || code === 93 || code === 125) {
          const top = stack?.[stack.length - 1] ?? rootFrame;
          if (top !== 0 && (top & CssFrame.CloseMask) === code) {
            if (stack?.length) stack.pop();
            else rootFrame = 0;
            context = top >> CssFrame.ContextShift;
            if (!(top & CssFrame.RuleBlock)) components--;
          }
        } else if (code === 58 && components === 0 && context === CssContext.DeclarationName) {
          context = CssContext.Value; valueEmpty = true;
        } else if (code === 59 && components === 0) {
          if (context === CssContext.AtPrelude) context = atParent;
          else if (context === CssContext.Value || context === CssContext.DeclarationName) context = CssContext.DeclarationList;
        }
      }
    }
    if (compressed && removableSemicolon) {
      const next = css.charCodeAt(getCssSignificantIndex(css, end));
      if (next === 125 || next === 59) {
        output += css.slice(segmentStart, declarationEnd ? end - 1 : index); segmentStart = end;
        if (declarationEnd) { previousCode = 0; previousKind = CssTokenKind.Name; previousEnd = end - 1; hasOutput = true; }
        index = end; continue;
      }
    }
    hasOutput = true;
    previousCode = kind === CssTokenKind.Delimiter || kind === CssTokenKind.Function ? css.charCodeAt(end - 1) : 0;
    previousKind = kind; previousEnd = end; index = end;
    if (rootFrame === 0 && context === CssContext.RuleList) safeEnd = output.length + end - segmentStart;
  }
  output += css.slice(segmentStart, index);
  if (mode === 'none') return output;
  const rootBlock = rootFrame !== 0 && (rootFrame & CssFrame.RuleBlock) !== 0;
  const rootContext = rootFrame !== 0 ? rootFrame >> CssFrame.ContextShift : context;
  if ((mode === 'document' && rootBlock) || (!rootBlock && rootContext !== CssContext.AtPrelude && (rootFrame !== 0 || context !== CssContext.RuleList))) return output.slice(0, safeEnd);
  let suffix = getCssEofSuffix(css, lastKind, lastStart, compressed);
  if (stack) for (let cursor = stack.length - 1; cursor >= 0; cursor--) suffix += String.fromCharCode(stack[cursor] & CssFrame.CloseMask);
  if (rootFrame !== 0) suffix += String.fromCharCode(rootFrame & CssFrame.CloseMask);
  if (!rootBlock && rootContext === CssContext.AtPrelude) suffix += ';';
  return output + suffix;
};
