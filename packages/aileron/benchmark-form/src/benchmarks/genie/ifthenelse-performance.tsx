import { Form as GenieForm } from '@react-genie-form/next';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';

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

// Vincent님의 if-then-else 스키마 (2회 이벤트 발행 패턴)
const ifThenElseSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['game', 'movie', 'book'],
      default: 'game',
    },
    title: { type: 'string' },
    openingDate: {
      type: 'string',
      format: 'date',
    },
    releaseDate: {
      type: 'string',
      format: 'date',
      default: '2025-01-01',
    },
    numOfPlayers: { type: 'number' },
    price: {
      type: 'number',
      minimum: 50,
      default: 100,
    },
    pages: { type: 'number' },
  },
  anyOf: [
    {
      properties: {
        category: {
          enum: ['movie'],
        },
      },
      required: ['title', 'openingDate', 'price'],
    },
    {
      properties: {
        category: {
          enum: ['game'],
        },
      },
      required: ['title', 'releaseDate', 'numOfPlayers'],
    },
    {
      properties: {
        category: {
          enum: ['book'],
        },
      },
      required: ['title', 'pages'],
    },
  ],
};

export async function runGenieIfThenElseBenchmark() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    let changeCount = 0;
    const switchingTimes: number[] = [];

    // 폼 렌더링
    root.render(
      <GenieForm
        schema={ifThenElseSchema}
        onValidate={() => {}}
        onChange={() => {
          changeCount++;
        }}
      />,
    );

    // 렌더링 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // if-then-else 전환 테스트 (game → movie → book → game)
    const switchSequence = ['movie', 'book', 'game'];

    for (const switchTo of switchSequence) {
      const startTime = performance.now();

      // 카테고리 변경으로 if-then-else 전환 트리거
      const categorySelect =
        container.querySelector('select') ||
        container.querySelector(`input[value="${switchTo}"]`);

      if (categorySelect) {
        if (categorySelect.tagName === 'SELECT') {
          (categorySelect as HTMLSelectElement).value = switchTo;
          categorySelect.dispatchEvent(
            new dom.window.Event('change', { bubbles: true }),
          );
        } else {
          (categorySelect as unknown as HTMLInputElement).checked = true;
          categorySelect.dispatchEvent(
            new dom.window.Event('change', { bubbles: true }),
          );
        }

        // if-then-else 전환 완료까지 대기 (Vincent님 말씀대로 2회 이벤트 발행)
        await new Promise((resolve) => setTimeout(resolve));
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
      // if-then-else 특화 메트릭
      eventMultiplier: changeCount / switchingTimes.length, // 실제로 2회 정도 나와야 함
      conditionEvaluationEfficiency: switchingTimes.length / avgSwitchingTime,
    };
  } finally {
    root.unmount();
    container.remove();
  }
}
