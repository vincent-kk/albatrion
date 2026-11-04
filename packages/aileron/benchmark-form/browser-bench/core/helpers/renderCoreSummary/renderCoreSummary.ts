import type { CoreSummary } from '../../reportTypes';
import { formatCoreBaselineOverflow } from './utils/formatCoreBaselineOverflow';
import { formatCoreFeedbackClasses } from './utils/formatCoreFeedbackClasses';
import { formatCoreFrameBudget } from './utils/formatCoreFrameBudget';
import { formatCoreMedian } from './utils/formatCoreMedian';
import { formatCoreMetricPair } from './utils/formatCoreMetricPair';
import { formatCoreNumber } from './utils/formatCoreNumber';
import { formatCoreRatio } from './utils/formatCoreRatio';
import { formatCoreTypingSpread } from './utils/formatCoreTypingSpread';
import { renderCoreWeightedExchange } from './utils/renderCoreWeightedExchange';

/**
 * Render the legend and the five summary tables shown locally, in the workflow summary and in the final report.
 * @param summary - Completed cases with their metrics; typing values are per write, frame observations per window.
 * @returns Markdown; measure mode omits baseline columns' values and the weighted table.
 */
export function renderCoreSummary(summary: CoreSummary): string {
  const rows = summary.cases;
  return [
    '# Core form browser benchmark',
    '',
    `${summary.mode}; ${summary.runs} runs and ${summary.warmup} warmup pages per variant.`,
    '',
    '## 범례',
    '',
    '- 단위는 ms. type 사례의 경과는 쓰기 20회의 핸들러 평균, 블로킹·검증기·피드백 값은 쓰기 2–20의 반복 비용(쓰기 1회당; 첫 쓰기는 표 4의 첫 쓰기 ms와 first-key 행). 다른 사례는 작업 1회당. 프레임 관측 수치는 20회 입력 창 전체(키 사이 대기 포함) 단위.',
    '- 첫 키: first-key-flat-500-validate는 첫 paint에서 즉시 입력해 예약된 로드 검증 컴파일과 측정 창이 겹칠 수 있습니다. first-key-flat-500-validate-after-load는 같은 fixture에서 onValidate 보고가 하나 이상 있고, 검증 실행 기록이 있으며 진행 중 실행이 없을 때 입력합니다(두 판 동일, 1000 ms 제한, 대기는 durationMs 제외). 초기 로드와 겹친 지연과 로드 검증 이후 입력 지연을 함께 보고하며 두 행 모두 가중치 1로 교환비에 포함합니다.',
    '- 명목 간격 frameIntervalNominalMs는 빈 rAF 중앙값을 60/120 Hz로 판별한 1000/Hz ms이며 표 4는 기준/후보를 표시한다. 허용 오차 ±3 ms, CI 최종 실행은 60 Hz(13.7–19.7 ms)만 허용한다. 초과 프레임 수는 페이지별 중앙값. 프레임 예산 16.7 ms(60 Hz, 주 예산)와 8.3 ms(120 Hz, 보조). 프레임 열은 블로킹 중앙값 / 해당 예산, 넘침은 max(0, 중앙값 − 해당 예산); 각 예산의 기준판 초과 여부를 함께 적는다. UX 판정과 가중 교환비는 16.7 ms 기준을 유지하며 8.3 ms 열은 참고용이다. mount·rebuild는 50 ms 미만을 재는 수단이 없어 N/A이며 대신 가장 긴 Long Task ms를 적는다.',
    '- 비율 = 후보 / 기준; Δ % = (후보 − 기준) / 기준 × 100; 기준 0 또는 비교 불가인 JSON null 비율·백분율은 N/A, 비교 자체가 없는 undefined는 —. 교환비 단위는 µs/event × 가중치.',
    '- Long Task API 문턱은 50 ms: "< 50"은 관측 없음이지 0이 아니다. 가장 긴 Long Task는 창과 겹친 작업의 원래 길이이고 창 안 합은 겹친 부분만 더한다.',
    '- 프레임 간격·가장 긴 간격·초과 합은 관측된 rAF 간격이며 CPU 블로킹과 구별한다. 검증기 구간은 동기/지연이 아니라 첫 프레임 전/후로 나눈다(0.16.1의 입력 검증은 매크로태스크라 첫 rAF 전에 돌 수 있다).',
    '- 화면 반영(type)은 다음 키 전에 마커 전이가 관측된 exact 쓰기의 조건부 평균이다. 부류 수(exact/censored/noChange/superseded)가 두 판에서 다르면 전체 피드백 개선으로 일반화하지 않는다. 블로킹 교환비에서 제외된 mount 비용은 0이 아니라 미측정 비용이다.',
    '- UX 판정: 블로킹은 RAIL 입력 처리 50 ms(표준값; type·first-key는 ≤ 16.7 ok, ≤ 50 perceptible, 그 밖 janky; mount·rebuild는 Long Task "< 50" ok, ≤ 100 perceptible[자체], 그 밖 janky). 피드백은 RAIL 반응 100 ms(표준값; ≤ 300 perceptible은 자체 임계), mount는 자체 로드 기준 ≤ 1000 ok, ≤ 2000 perceptible. n/a는 관측 불가.',
    '- 판정은 권고. 경과 판정은 기존 규칙(typing 0.05 ms, 그 밖 0.5 ms 또는 5 %/3 %; 무효 대조군은 한 번 재시도 뒤 void). 지연 지표(검증기 완료·화면 반영·보고 콜백·프레임 간격)는 max(2 ms, 5 %), CPU 지표(블로킹·Long Task·검증기 구간)는 max(0.5 ms, 5 %); 지표별 대조군이 띠 밖이면 그 지표만 void.',
    '- validate 사례는 루트 프로브 잎 `/probe`(기본값 x, 홀수 길이)를 더해 `/probe` 오류가 정확히 하나 생기며 두 판에 같이 적용된다. 배열 fixture의 다른 항목 오류는 두 판 동일 비용이고 측정 경로가 아니다.',
    '',
    '## 1. 경과·동기',
    '',
    '| 사례 | 기준 ms | 후보 ms | 후보 p95 | 비율 | Δ ms | Δ % | 판정 | 시도 |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreNumber(row.baseline?.medianMs)} | ${formatCoreNumber(row.candidate.medianMs)} | ${formatCoreNumber(row.candidate.p95Ms)} | ${formatCoreRatio(row.metrics.durationMs.ratio)} | ${formatCoreNumber(row.deltaMs)} | ${formatCoreRatio(row.metrics.durationMs.deltaPercent, 1)} | ${row.verdict} | ${row.attempt ?? '—'} |`,
    ),
    '',
    '## 2. 블로킹',
    '',
    '| 사례 | 기준 블로킹 ms | 후보 블로킹 ms | Δ % | 판정 | 16.7 ms 프레임(기준/후보) | 16.7 ms 넘침 ms(기준/후보) | 16.7 ms 기준판도 초과 | 8.3 ms 프레임(기준/후보) | 8.3 ms 넘침 ms(기준/후보) | 8.3 ms 기준판도 초과 | 가장 긴 Long Task ms(기준/후보) | 창 안 Long Task 합 ms(기준/후보) | 첫 프레임 전 검증기 ms(기준/후보) | 첫 프레임 뒤 검증기 ms(기준/후보) |',
    '| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreMedian(row.metrics.blockingMs.baseline)} | ${formatCoreMedian(row.metrics.blockingMs.candidate)} | ${formatCoreRatio(row.metrics.blockingMs.deltaPercent, 1)} | ${row.metrics.blockingMs.verdict} | ${formatCoreFrameBudget(row.budget.baseline, 'frames')} / ${formatCoreFrameBudget(row.budget.candidate, 'frames')} | ${formatCoreFrameBudget(row.budget.baseline, 'overflowMs')} / ${formatCoreFrameBudget(row.budget.candidate, 'overflowMs')} | ${formatCoreBaselineOverflow(row.budget.baseline)} | ${formatCoreFrameBudget(row.budget120.baseline, 'frames')} / ${formatCoreFrameBudget(row.budget120.candidate, 'frames')} | ${formatCoreFrameBudget(row.budget120.baseline, 'overflowMs')} / ${formatCoreFrameBudget(row.budget120.candidate, 'overflowMs')} | ${formatCoreBaselineOverflow(row.budget120.baseline)} | ${formatCoreMetricPair(row, 'maxLongTaskMs')} (관측 ${row.frames.baseline?.longTaskObservedSamples ?? '—'}/${row.baseline?.samples ?? '—'} / ${row.frames.candidate.longTaskObservedSamples}/${row.candidate.samples}) | ${formatCoreMetricPair(row, 'longTaskOverlapMs')} | ${formatCoreMetricPair(row, 'preFrameValidatorMs')} | ${formatCoreMetricPair(row, 'postFrameValidatorMs')} |`,
    ),
    '',
    '## 3. 피드백',
    '',
    '| 사례 | 검증기 완료 ms(기준/후보) | 화면 반영 ms(기준/후보) | 비율 | Δ % | 판정 | 보고 콜백 ms(기준/후보, 로드만) | 피드백 부류 exact/censored/noChange/superseded (기준) | 피드백 부류 (후보) | 합쳐진 쓰기 수(기준/후보) |',
    '| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreMetricPair(row, 'validatorSettledMs')} | ${formatCoreMetricPair(row, 'feedbackCommittedMs')} | ${formatCoreRatio(row.metrics.feedbackCommittedMs.ratio)} | ${formatCoreRatio(row.metrics.feedbackCommittedMs.deltaPercent, 1)} | ${row.metrics.feedbackCommittedMs.verdict} | ${formatCoreMetricPair(row, 'validationReportedMs')} | ${formatCoreFeedbackClasses(row.typing, 'baseline')} | ${formatCoreFeedbackClasses(row.typing, 'candidate')} | ${row.typing ? `${row.typing.baseline?.coalescedWrites ?? '—'} / ${row.typing.candidate.coalescedWrites}` : '—'} |`,
    ),
    '',
    '## 4. 프레임 관측·UX',
    '',
    '| 사례 | 명목 간격 ms(기준/후보) | 가장 긴 간격 ms(기준/후보) | 초과 합 ms(기준/후보) | 초과 프레임 수(기준/후보) | 8.3 ms 초과 합 ms(기준/후보) | 8.3 ms 초과 프레임 수(기준/후보) | 초과 프레임 판정 | 타이핑 첫 쓰기 ms · max 핸들러 ms · 초과 횟수(기준) | 같은 값(후보) | UX 블로킹(기준/후보) | UX 피드백(기준/후보) |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${row.frames.baseline?.frameIntervalNominalMs.map((period) => formatCoreNumber(period)).join(', ') ?? '—'} / ${row.frames.candidate.frameIntervalNominalMs.map((period) => formatCoreNumber(period)).join(', ')} | ${formatCoreMetricPair(row, 'longestFrameMs')} | ${formatCoreMetricPair(row, 'frameOverflowMs')} | ${formatCoreNumber(row.frames.baseline?.overBudgetFrames.medianMs, 1)} / ${formatCoreNumber(row.frames.candidate.overBudgetFrames.medianMs, 1)} | ${formatCoreNumber(row.frames.baseline?.frameBudget120.frameOverflowMs.medianMs)} / ${formatCoreNumber(row.frames.candidate.frameBudget120.frameOverflowMs.medianMs)} | ${formatCoreNumber(row.frames.baseline?.frameBudget120.overBudgetFrames.medianMs, 1)} / ${formatCoreNumber(row.frames.candidate.frameBudget120.overBudgetFrames.medianMs, 1)} | ${row.metrics.frameOverflowMs.verdict} | ${formatCoreTypingSpread(row.typing, 'baseline')} | ${formatCoreTypingSpread(row.typing, 'candidate')} | ${row.ux.baseline?.blocking ?? '—'} / ${row.ux.candidate.blocking} | ${row.ux.baseline?.feedback ?? '—'} / ${row.ux.candidate.feedback} |`,
    ),
    '',
    ...(summary.weighted
      ? [
          '## 5. 가중 교환비',
          '',
          ...renderCoreWeightedExchange(
            '블로킹 교환비',
            summary.weighted.blocking,
          ),
          ...renderCoreWeightedExchange(
            '피드백 교환비 (exact 쓰기의 조건부 평균)',
            summary.weighted.feedback,
          ),
        ]
      : []),
    'An invalid baseline/control group is retried once, then marked void.',
    '',
  ].join('\n');
}
