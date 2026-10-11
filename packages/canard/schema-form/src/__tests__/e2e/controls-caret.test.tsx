import { useLayoutEffect, useRef } from 'react';

import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FormTypeInputProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/** Format the consumer's card draft; caret restoration is separately owned. */
const format = (raw: string) => raw.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');

/** Render an ordinary controlled consumer with optional card caret bookkeeping. */
const Input = ({ path, value, onChange, formatter, bookkeeping, rendered, compositionEnded }: FormTypeInputProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  rendered?.();
  useLayoutEffect(() => {
    if (caret.current !== null) {
      ref.current?.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });
  return <input id={path} ref={ref} value={value ?? ''}
    onCompositionEnd={compositionEnded}
    onChange={(event) => {
      const raw = event.target.value;
      const next = formatter ? format(raw) : raw;
      if (bookkeeping) {
        const digits = raw.slice(0, event.target.selectionStart ?? raw.length).replace(/\D/g, '').length;
        let position = 0;
        let seen = 0;
        while (position < next.length && seen < digits) {
          if (/\d/.test(next[position])) seen++;
          position++;
        }
        if (next[position] === '-') position++;
        caret.current = position;
      }
      onChange(next);
    }} />;
};

/** Mount the real binding with a consumer-owned controlled input. */
const mount = (value: string, props: Record<string, unknown> = {}) => renderForm({
  type: 'object', properties: { text: { type: 'string', presentation: { FormTypeInput: Input, FormTypeInputProps: props } } },
}, { defaultValue: { text: value } });

/** Dispatch the DOM value change a browser makes before React handles input. */
const nativeInput = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  fireEvent.input(input);
};

describe('EVENT-003 / EVENT-065 — caret spike dispositions', () => {
  it('EVENT-003 포맷터의 끝 입력마다 값과 캐럿이 일치한다', async () => {
    const form = await mount('', { formatter: true, bookkeeping: true });
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.click(input);
      for (const [key, value, position] of [['1', '1', 1], ['2', '12', 2], ['3', '123', 3], ['4', '1234', 4], ['5', '1234-5', 6], ['6', '1234-56', 7]] as const) {
        await form.user.keyboard(key);
        expect([input.value, input.selectionStart]).toEqual([value, position]);
        expect(form.node('/text')?.value).toBe(value);
      }
    } finally { form.unmount(); }
  });

  it('EVENT-003 포맷터의 중간 삽입 뒤 캐럿이 삽입한 숫자를 따른다', async () => {
    const form = await mount('1234-5678', { formatter: true, bookkeeping: true });
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.type(input, '9', { initialSelectionStart: 2, initialSelectionEnd: 2 });
      expect([input.value, input.selectionStart]).toEqual(['1293-4567-8', 3]);
      expect(form.node('/text')?.value).toBe(input.value);
    } finally { form.unmount(); }
  });

  it('EVENT-003 캐럿 복구가 없는 사용자 포맷터의 캐럿을 바인딩이 대신 복구하지 않는다', async () => {
    const form = await mount('1234-5678', { formatter: true });
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.type(input, '9', { initialSelectionStart: 2, initialSelectionEnd: 2 });
      expect([input.value, input.selectionStart]).toEqual(['1293-4567-8', 11]);
    } finally { form.unmount(); }
  });

  it('EVENT-002 일반 제어 입력의 중간 연속 삽입에서 캐럿과 값이 유지된다', async () => {
    const form = await mount('abcd');
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.click(input);
      input.setSelectionRange(2, 2);
      await form.user.keyboard('x');
      expect([input.value, input.selectionStart]).toEqual(['abxcd', 3]);
      await form.user.keyboard('y');
      expect([input.value, input.selectionStart, form.node('/text')?.value]).toEqual(['abxycd', 4, 'abxycd']);
    } finally { form.unmount(); }
  });

  it('EVENT-002 입력 이벤트 반환 직후 DOM이 커밋 값과 일치하고 입력은 한 번 갱신된다', async () => {
    const rendered = vi.fn();
    const form = await mount('1234', { formatter: true, bookkeeping: true, rendered });
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.click(input);
      rendered.mockClear();
      nativeInput(input, '12345');
      expect([input.value, input.selectionStart, form.node('/text')?.value]).toEqual(['1234-5', 6, '1234-5']);
      expect(rendered).toHaveBeenCalledTimes(1);
    } finally { form.unmount(); }
  });

  it('EVENT-065 IME 조합의 각 입력 직후 DOM이 조합 중인 글자를 보존한다', async () => {
    const compositionEnded = vi.fn();
    const form = await mount('', { compositionEnded });
    try {
      const input = form.field('/text') as HTMLInputElement;
      await form.user.click(input);
      fireEvent.compositionStart(input, { data: '' });
      const setter = vi.spyOn(input, 'value', 'set');
      try {
        for (const syllable of ['ㄱ', '가', '각']) {
          nativeInput(input, syllable);
          expect(input.value).toBe(syllable);
          expect(setter).not.toHaveBeenCalled();
        }
      } finally { setter.mockRestore(); }
      fireEvent.compositionEnd(input, { data: '각' });
      expect(compositionEnded).toHaveBeenCalledTimes(1);
      expect(form.node('/text')?.value).toBe('각');
    } finally { form.unmount(); }
  });
});
