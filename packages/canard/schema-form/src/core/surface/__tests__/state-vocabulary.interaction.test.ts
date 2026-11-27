import { describe, expect, it } from 'vitest';

import { FieldNodeState, blueprint } from '../../engine';
import { reloadFieldNodeForm } from '../utils/binding/reloadFieldNodeForm';
import { writeFieldNodeInput } from '../utils/binding/writeFieldNodeInput';
import { fieldNodeFactory } from '../utils/fieldNodeFactory';
import { makeVocabularyTree } from './fixtures/makeVocabularyTree';

describe('state-vocabulary interaction getters', () => {
  it('reads false before the first load', () => {
    const root = fieldNodeFactory(blueprint({ type: 'string' }), {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
    });
    expect(root.isEdited).toBe(false);
    expect(root.isTouched).toBe(false);
  });

  it('user input sets isEdited and blur state sets isTouched', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    writeFieldNodeInput(root, 'input');
    expect(root.isEdited).toBe(true);
    expect(root.isDivergent).toBe(true);
    expect(root.isTouched).toBe(false);
    root.setState({ [FieldNodeState.Touched]: true });
    expect(root.isTouched).toBe(true);
  });

  it('setState follows truthiness and clearSubtreeState clears both getters', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    const state: typeof root.state = {};
    Reflect.set(state, FieldNodeState.Edited, 1);
    Reflect.set(state, FieldNodeState.Touched, 'yes');
    root.setState(state);
    expect(root.isEdited).toBe(true);
    expect(root.isTouched).toBe(true);
    root.clearSubtreeState();
    expect(root.isEdited).toBe(false);
    expect(root.isTouched).toBe(false);
  });

  it('form reset clears both getters', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    root.setState({
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    });
    reloadFieldNodeForm(root, 'reset');
    expect(root.isEdited).toBe(false);
    expect(root.isTouched).toBe(false);
  });

  it('controls.resetInteraction clears both getters', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          value: { type: 'string', controls: { resetInteraction: '../flag' } },
        },
      },
      { flag: false, value: 'loaded' },
    );
    const node = root.find('/value');
    if (!node) throw new Error('Missing value');
    node.setState({
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    });
    root.find('/flag')?.setValue(true);
    expect(node.isEdited).toBe(false);
    expect(node.isTouched).toBe(false);
  });

  it('strict-false new getter contract: programmatic setValue', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    root.setValue('programmatic');
    expect(root.isEdited).toBe(false);
  });

  it('strict-false new getter contract: array verbs', () => {
    const root = makeVocabularyTree(
      { type: 'array', items: { type: 'string' } },
      ['a'],
    );
    if (root.type !== 'array') throw new Error('Expected array');
    root.push('b');
    root.update(0, 'c');
    root.insert(0, 'd');
    root.remove(0);
    root.pop();
    root.clear();
    expect(root.isEdited).toBe(false);
  });

  it('strict-false new getter contract: default fill', () => {
    const root = makeVocabularyTree(
      { type: 'string', default: 'filled' },
      undefined,
    );
    expect(root.value).toBe('filled');
    expect(root.isEdited).toBe(false);
  });
});

describe('base guards: programmatic and automatic writes preserve the interaction flag', () => {
  it('guard: setValue never sets the input flag', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    root.setValue('programmatic');
    expect(!!root.state[FieldNodeState.Edited]).toBe(false);
    expect(root.isEdited).toBe(false);
  });
  it('guard: array verbs never set the input flag', () => {
    const root = makeVocabularyTree(
      { type: 'array', items: { type: 'string' } },
      ['a'],
    );
    if (root.type !== 'array') throw new Error('Expected array');
    root.push('b');
    root.update(0, 'c');
    root.insert(0, 'd');
    root.remove(0);
    root.pop();
    root.clear();
    expect(!!root.state[FieldNodeState.Edited]).toBe(false);
    expect(root.isEdited).toBe(false);
  });
  it('guard: default fill never sets the input flag', () => {
    const root = makeVocabularyTree(
      { type: 'string', default: 'filled' },
      undefined,
    );
    expect(root.value).toBe('filled');
    expect(!!root.state[FieldNodeState.Edited]).toBe(false);
    expect(root.isEdited).toBe(false);
  });
});
