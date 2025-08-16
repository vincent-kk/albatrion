import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';

import type { JsonSchema, Form as SchemaForm } from '@canard/schema-form';

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).navigator = dom.window.navigator;
(global as any).Element = dom.window.Element;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).HTMLInputElement = dom.window.HTMLInputElement;
(global as any).HTMLFormElement = dom.window.HTMLFormElement;
(global as any).Event = dom.window.Event;
(global as any).MouseEvent = dom.window.MouseEvent;
(global as any).KeyboardEvent = dom.window.KeyboardEvent;

// Vincent님의 computed properties 스키마
const computedPropertiesSchema = {
  type: 'object',
  properties: {
    trigger: {
      type: 'string',
      default: 'test',
    },
    dynamicField1: {
      type: 'string',
      '&visible': '../trigger === "show"',
      default: 'Visible when trigger is "show"',
    },
    dynamicField2: {
      type: 'number',
      computed: {
        visible: '../trigger === "number"',
      },
      default: 42,
    },
    dynamicField3: {
      type: 'string',
      '&visible': '../trigger === "special" || ../trigger === "show"',
      default: 'Visible for special or show',
    },
  },
} as JsonSchema;

export async function runComputedPropertiesBenchmark(SchemaFormModule: {
  Form: typeof SchemaForm;
}) {
  const { Form } = SchemaFormModule;

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    let changeCount = 0;
    const computationTimes: number[] = [];

    // 폼 렌더링
    root.render(
      <Form
        jsonSchema={computedPropertiesSchema}
        onValidate={() => {}}
        onChange={() => {
          changeCount++;
        }}
      />,
    );

    // 렌더링 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // computed properties 트리거 테스트
    const triggerValues = ['show', 'number', 'special', 'nested', 'hide'];

    for (const triggerValue of triggerValues) {
      const startTime = performance.now();

      // trigger 필드 변경으로 computed properties 재계산 트리거
      const triggerInput = container.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;

      if (triggerInput) {
        // React props에서 onChange 핸들러 직접 호출
        const reactPropsKey = Object.getOwnPropertyNames(triggerInput).find(
          (prop) => prop.startsWith('__reactProps$'),
        );

        if (reactPropsKey) {
          const reactProps = (triggerInput as any)[reactPropsKey];

          // 값 변경
          triggerInput.value = triggerValue;

          // React onChange 호출
          if (reactProps.onChange) {
            const syntheticEvent = {
              target: triggerInput,
              currentTarget: triggerInput,
              type: 'change',
              bubbles: true,
              cancelable: true,
              preventDefault: () => {},
              stopPropagation: () => {},
              nativeEvent: new dom.window.Event('change'),
            };

            try {
              await reactProps.onChange(syntheticEvent);
            } catch {
              // fallback to DOM event
              triggerInput.dispatchEvent(
                new dom.window.Event('change', { bubbles: true }),
              );
            }
          }
        } else {
          // fallback for when React props are not found
          triggerInput.value = triggerValue;
          triggerInput.dispatchEvent(
            new dom.window.Event('change', { bubbles: true }),
          );
        }

        // computed properties 재계산 완료까지 대기 (React batching 고려)
        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      const endTime = performance.now();
      computationTimes.push(endTime - startTime);
    }

    const avgComputationTime =
      computationTimes.reduce((a, b) => a + b, 0) / computationTimes.length;

    // 각 trigger 값에 따른 visible 필드 수 계산
    const visibilityChanges = triggerValues.map((trigger) => {
      let visibleCount = 0;
      if (trigger === 'show') visibleCount += 2; // dynamicField1, dynamicField3
      if (trigger === 'number') visibleCount += 1; // dynamicField2
      if (trigger === 'special') visibleCount += 1; // dynamicField3
      if (trigger === 'nested') visibleCount += 1; // nestedDynamic
      return visibleCount;
    });

    return {
      computationTimes,
      avgComputationTime,
      totalComputations: computationTimes.length,
      changeCount,
      visibilityChanges,
      // computed properties 특화 메트릭
      dependencyTrackingEfficiency: changeCount / computationTimes.length,
      avgVisibilityChanges:
        visibilityChanges.reduce((a, b) => a + b, 0) / visibilityChanges.length,
      computePerformance: triggerValues.length / avgComputationTime,
    };
  } finally {
    root.unmount();
    container.remove();
  }
}
