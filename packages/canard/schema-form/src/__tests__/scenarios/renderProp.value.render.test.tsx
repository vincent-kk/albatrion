import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import { Form, type FormChildrenProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Function-children (render-prop) `value` reactivity.
 *
 * Function children are bridged through `FormChildrenRenderer`, which uses
 * the same `useSchemaNodeTracker` idiom as `SchemaNodeProxy`: matching root
 * events (UpdateValue / UpdateGlobalError / RequestRefresh / RequestRemount)
 * bump a version and the render-prop reads live node state during render.
 * React batches same-tick version bumps, so one edit re-runs the render-prop
 * once. Element children must stay completely unaffected by value-only events.
 */

const SCHEMA = {
  type: 'object',
  properties: {
    accountType: { type: 'string' },
    companyName: { type: 'string' },
  },
} as const;

const conditionalChildren = ({ value }: FormChildrenProps<any, any>) => (
  <>
    <Form.Input path="/accountType" />
    {value?.accountType === 'business' && <Form.Input path="/companyName" />}
  </>
);

describe('renderProp.value: 함수형 children의 value 반응성', () => {
  it('타이핑으로 value 조건부 필드가 나타난다 (공개 JSDoc 예시 패턴)', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: conditionalChildren,
      } as any,
    );
    expect(form.exists('/companyName')).toBe(false);

    await form.type('/accountType', 'business');
    await form.flush();

    expect(form.exists('/companyName')).toBe(true);
    expect(form.getValue()).toEqual({ accountType: 'business' });
    expect(form.caughtErrors()).toEqual([]);
  });

  it('조건이 깨지면 조건부 필드가 사라진다', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: conditionalChildren,
      } as any,
    );
    await form.type('/accountType', 'business');
    await form.flush();
    expect(form.exists('/companyName')).toBe(true);

    await form.clear('/accountType');
    await form.flush();
    expect(form.exists('/companyName')).toBe(false);
  });

  it('render-prop 재실행은 편집(키 입력) 1회당 1회로 코얼레스된다', async () => {
    let calls = 0;
    const form = await renderForm(
      SCHEMA as any,
      {
        children: (props: FormChildrenProps<any, any>) => {
          calls++;
          return conditionalChildren(props);
        },
      } as any,
    );
    const baseline = calls;

    await form.type('/accountType', 'b');
    await form.flush();

    expect(calls - baseline).toBe(1);
  });

  it('엘리먼트(비함수) children은 value 변경에 재생성되지 않는다', async () => {
    let probeRenders = 0;
    const Probe = () => {
      probeRenders++;
      return <Form.Input path="/accountType" />;
    };
    const form = await renderForm(
      SCHEMA as any,
      {
        children: <Probe />,
      } as any,
    );
    const baseline = probeRenders;

    await form.type('/accountType', 'business');
    await form.flush();

    expect(probeRenders).toBe(baseline);
    expect(form.getValue()).toEqual({ accountType: 'business' });
  });

  it('render-prop이 받은 value는 settle 후 getValue()와 일치한다', async () => {
    let lastValue: any;
    const form = await renderForm(
      SCHEMA as any,
      {
        children: (props: FormChildrenProps<any, any>) => {
          lastValue = props.value;
          return conditionalChildren(props);
        },
      } as any,
    );

    await form.type('/accountType', 'business');
    await form.flush();

    expect(lastValue).toEqual(form.getValue());
  });

  it('reset(버전 리마운트) 후에도 value 반응성이 유지된다', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: conditionalChildren,
      } as any,
    );
    await form.type('/accountType', 'business');
    await form.flush();
    expect(form.exists('/companyName')).toBe(true);

    await form.reset();
    expect(form.exists('/companyName')).toBe(false);

    await form.type('/accountType', 'business');
    await form.flush();
    expect(form.exists('/companyName')).toBe(true);
  });

  it('StrictMode에서도 동일하게 동작하고 수렴 오류가 없다', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        strictMode: true,
        children: conditionalChildren,
      } as any,
    );

    await form.type('/accountType', 'business');
    await form.flush();

    expect(form.exists('/companyName')).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('프로그램적 setValue(Overwrite) 경로에서도 조건부 필드가 나타난다', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        children: conditionalChildren,
      } as any,
    );

    await form.setValue({ accountType: 'business' });

    expect(form.exists('/companyName')).toBe(true);
    expect(form.value('/companyName')).toBe('');
  });

  it('validate() 이후 전역 에러가 render-prop errors로 전달된다', async () => {
    let lastErrors: any;
    const form = await renderForm(
      {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      } as any,
      {
        validator: true,
        children: (props: FormChildrenProps<any, any>) => {
          lastErrors = props.errors;
          return <Form.Input path="/name" />;
        },
      } as any,
    );

    await form.validate();
    await form.flush();

    expect((lastErrors ?? []).length).toBeGreaterThan(0);
  });

  it('defaultValue로 조건이 이미 참이면 마운트 직후부터 조건부 필드가 렌더된다', async () => {
    const form = await renderForm(
      SCHEMA as any,
      {
        defaultValue: { accountType: 'business' },
        children: conditionalChildren,
      } as any,
    );

    expect(form.exists('/companyName')).toBe(true);
    expect(form.getValue()).toEqual({ accountType: 'business' });
  });
});
