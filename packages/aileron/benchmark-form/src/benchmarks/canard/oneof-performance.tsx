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

// Vincent님의 @canard/schema-form 문법에 맞게 수정
const oneOfSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['personal', 'business', 'other'],
      default: 'personal',
    },
  },
  oneOf: [
    {
      '&if': "./type === 'personal'",
      properties: {
        personalData: {
          type: 'object',
          properties: {
            hobby: { type: 'string', default: 'reading' },
            favoriteColor: { type: 'string', default: 'blue' },
            petName: { type: 'string', default: 'fluffy' },
          },
        },
      },
    },
    {
      '&if': "./type === 'business'",
      properties: {
        businessData: {
          type: 'object',
          properties: {
            company: { type: 'string', default: 'Acme Corp' },
            position: { type: 'string', default: 'Developer' },
            department: { type: 'string', default: 'Engineering' },
          },
        },
      },
    },
    {
      '&if': "./type === 'other'",
      properties: {
        otherData: {
          type: 'object',
          properties: {
            description: { type: 'string', default: 'Other description' },
            category: { type: 'string', default: 'misc' },
          },
        },
      },
    },
  ],
} satisfies JsonSchema;

export async function runOneOfBenchmark(SchemaFormModule: {
  Form: typeof SchemaForm;
}) {
  const { Form } = SchemaFormModule;

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    let changeCount = 0;
    const switchingTimes: number[] = [];

    // 폼 렌더링
    root.render(
      <Form
        jsonSchema={oneOfSchema}
        onValidate={() => {}}
        onChange={() => {
          changeCount++;
        }}
      />,
    );

    // 렌더링 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // oneOf 전환 테스트 (personal → business → other → personal)
    const switchSequence = ['business', 'other', 'personal'];

    for (const switchTo of switchSequence) {
      const startTime = performance.now();

      // 타입 변경으로 oneOf 전환 트리거
      const typeSelect =
        container.querySelector('select') ||
        container.querySelector(`input[value="${switchTo}"]`);

      if (typeSelect) {
        // React props에서 onChange 핸들러 직접 호출
        const reactPropsKey = Object.getOwnPropertyNames(typeSelect).find(
          (prop) => prop.startsWith('__reactProps$'),
        );

        if (reactPropsKey) {
          const reactProps = (typeSelect as any)[reactPropsKey];

          if (typeSelect.tagName === 'SELECT') {
            (typeSelect as HTMLSelectElement).value = switchTo;
          } else {
            (typeSelect as unknown as HTMLInputElement).checked = true;
          }

          // React onChange 호출
          if (reactProps.onChange) {
            const syntheticEvent = {
              target: typeSelect,
              currentTarget: typeSelect,
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
              typeSelect.dispatchEvent(
                new dom.window.Event('change', { bubbles: true }),
              );
            }
          }
        } else {
          // fallback for when React props are not found
          if (typeSelect.tagName === 'SELECT') {
            (typeSelect as HTMLSelectElement).value = switchTo;
            typeSelect.dispatchEvent(
              new dom.window.Event('change', { bubbles: true }),
            );
          } else {
            (typeSelect as unknown as HTMLInputElement).checked = true;
            typeSelect.dispatchEvent(
              new dom.window.Event('change', { bubbles: true }),
            );
          }
        }

        // oneOf 전환 완료까지 대기 (React batching과 3회 이벤트 발행 고려)
        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      const endTime = performance.now();
      switchingTimes.push(endTime - startTime);
    }

    const avgSwitchingTime =
      switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length;

    return {
      switchingTimes,
      avgSwitchingTime,
      totalSwitches: switchingTimes.length,
      changeCount,
      // Vincent님 아키텍처 특화 메트릭
      eventMultiplier: changeCount / switchingTimes.length, // 실제 이벤트 발행 배수
      efficiencyScore: switchingTimes.length / avgSwitchingTime, // 전환 효율성
    };
  } finally {
    root.unmount();
    container.remove();
  }
}
