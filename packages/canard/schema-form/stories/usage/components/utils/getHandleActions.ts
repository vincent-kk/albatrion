import { submitOutcomes } from '@aileron/schema-form-scenarios';

import { FieldNodeState, SetValueOption } from '../../../../src';

import type { HandleAction, HandleExampleName } from '../types';

/**
 * Poll a consumer DOM readout with browser-owned timers, without Storybook's asyncWrapper.
 * @param ready - Nonthrowing predicate that becomes true once the requested readout settles.
 * @returns Completion immediately or after polling every 10 ms for at most 1000 ms.
 * @throws With "Workbench readout timed out" when the readout does not settle in time.
 */
function untilReadout(ready: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 1000;
    const poll = () => { if (ready()) resolve(); else if (Date.now() >= deadline) reject(new Error('Workbench readout timed out')); else setTimeout(poll, 10); };
    poll();
  });
}

/**
 * Capture the error text currently drawn by the workbench's default field renderer.
 * @param root - This workbench's canvas, excluding other stories and their Call logs.
 * @returns Nonempty rendered field messages in document order.
 */
function readErrorMessages(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('[data-path] em'), (element) => element.textContent?.trim() ?? '').filter(Boolean);
}

/**
 * Describe the method buttons for one usage story using the current ref at call time.
 * @param example - The CSF-selected method group.
 * @returns Actions that return consumer readouts rather than retaining live nodes.
 */
export function getHandleActions(example: HandleExampleName): readonly HandleAction[] {
  switch (example) {
    case 'RootNode': return [{ label: 'Read root node', method: 'node', args: [], run: (handle) => ({ path: handle.node?.path, type: handle.node?.type, value: handle.node?.value }) }];
    case 'FindNodes': return [
      { label: 'Find title node', method: 'findNode', args: ['/title'], run: (handle) => ({ path: handle.findNode('/title')?.path }) },
      { label: 'Find child nodes', method: 'findNodes', args: ['/*'], run: (handle) => handle.findNodes('/*').map((node) => node.path) },
    ];
    case 'ReadAndWriteValue': {
      const updateTitle = (value: Record<string, unknown>) => ({ ...value, title: 'Updated' });
      return [
      { label: 'Read value', method: 'getValue', args: [], run: (handle) => handle.getValue() },
      { label: 'Write value', method: 'setValue', args: [{ title: 'Written', count: 2, enabled: true }], run: (handle) => { handle.setValue({ title: 'Written', count: 2, enabled: true }); return handle.getValue(); } },
      { label: 'Update value', method: 'setValue', args: [updateTitle], run: (handle) => { handle.setValue(updateTitle); return handle.getValue(); } },
    ];
    }
    case 'InteractionState': {
      const state = { [FieldNodeState.Edited]: true, [FieldNodeState.Touched]: true, [FieldNodeState.ErrorVisible]: true };
      return [
      { label: 'Read state', method: 'getState', args: [], run: (handle) => handle.getState() },
      { label: 'Set interaction flags', method: 'setState', args: [state], run: (handle) => {
        handle.setState(state); return handle.getState();
      } },
      { label: 'Clear state', method: 'clearState', args: [], run: (handle) => { handle.clearState(); return handle.getState(); } },
    ];
    }
    case 'Errors': return [
      { label: 'Validate', method: 'validate', args: [], run: (handle) => handle.validate() },
      { label: 'Read errors', method: 'getErrors', args: [], run: (handle) => handle.getErrors() },
      { label: 'Show errors', method: 'showError', args: [true], async run(handle, root) {
        handle.showError(true);
        await untilReadout(() => readErrorMessages(root).length > 0 || handle.getErrors().length === 0);
        const messages = readErrorMessages(root);
        return { visible: messages.length > 0, messages };
      } },
      { label: 'Restore error prop', method: 'showError', args: [false], async run(handle, root) {
        handle.showError(false);
        await untilReadout(() => readErrorMessages(root).length === 0);
        const messages = readErrorMessages(root);
        return { visible: messages.length > 0, messages };
      } },
    ];
    case 'FocusAndSelect': return [
      { label: 'Focus title', method: 'focus', args: ['/title'], async run(handle, root) {
        handle.focus('/title');
        const input = root.querySelector<HTMLInputElement>('input[id="/title"]')!;
        await untilReadout(() => input.ownerDocument.activeElement === input);
        return { activeElement: input.ownerDocument.activeElement?.id };
      } },
      { label: 'Select title', method: 'select', args: ['/title'], async run(handle, root) {
        handle.select('/title');
        const input = root.querySelector<HTMLInputElement>('input[id="/title"]')!;
        await untilReadout(() => input.selectionEnd === input.value.length && input.selectionStart === 0);
        return { activeElement: input.ownerDocument.activeElement?.id, selectionStart: input.selectionStart, selectionEnd: input.selectionEnd };
      } },
    ];
    case 'RefreshAndRemount': return [
      { label: 'Refresh title', method: 'refresh', args: ['/title'], run: (handle) => { handle.refresh('/title'); return handle.getValue(); } },
      { label: 'Remount title', method: 'remount', args: ['/title'], async run(handle, root) {
        const before = root.querySelector('input[id="/title"]');
        handle.remount('/title');
        await untilReadout(() => root.querySelector('input[id="/title"]') !== before);
        return { replaced: root.querySelector('input[id="/title"]') !== before, value: handle.getValue() };
      } },
    ];
    case 'Reset': return [
      { label: 'Change value', method: 'setValue', args: [{ title: 'Changed' }], run: (handle) => { handle.setValue({ title: 'Changed' }); return handle.getValue(); } },
      { label: 'Reset defaults', method: 'reset', args: [], run: (handle) => { handle.reset(); return handle.getValue(); } },
      { label: 'Reset without automatic writes', method: 'reset', args: [SetValueOption.DisableAutomaticWrites], run: (handle) => { handle.reset(SetValueOption.DisableAutomaticWrites); return handle.getValue(); } },
    ];
    case 'Submit': return [
      { label: 'Submit invalid value', method: 'submit', args: [], run: (handle) => handle.submit() },
      { label: 'Write valid value', method: 'setValue', args: [{ email: submitOutcomes.validEmail }], run: (handle) => { handle.setValue({ email: submitOutcomes.validEmail }); return handle.getValue(); } },
      { label: 'Submit valid value', method: 'submit', args: [], run: (handle) => handle.submit() },
    ];
    case 'AttachedFiles': return [{ label: 'Read attached files', method: 'getAttachedFilesMap', args: [], run: (handle) => {
      const files = handle.getAttachedFilesMap();
      return { size: files.size, paths: [...files.keys()], files: Object.fromEntries([...files].map(([path, attached]) => [path, attached.map((file) => file.name)])) };
    } }];
  }
}
