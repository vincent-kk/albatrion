# 분기 변경 1b·2의 회귀 진단

대상은 커밋 `e59e435aa`의 고정 사본에 1b 패치와 2 패치를 각각 적용한 판과 HEAD입니다. 세션 119의 번들(`b-head`, `b-1b`, `b-2`)과 다시 번들한 결과는 바이트가 같았습니다. 진단은 읽기 전용 Opus debugger가 했고, 저장소는 바꾸지 않았습니다. 측정용 Node는 v26.10.0(`/opt/homebrew/bin/node`)입니다. 도구와 원자료는 세션 scratchpad의 `core-diag/`에 있습니다(`tools/drive.mjs`, `pair.mjs`, `alloc.mjs`, `prof.mjs`, `profpair.mjs`, `traces/`, `prof/`, 기여도 분리용 번들 `bundles/b-a5·a6·a8·a9·headx`).

## 결론

1. **1b의 if-then 회귀(첫 갱신·갱신)는 비합집합 호스트에서도 쓰기마다 계획 함수를 부르는 데서 생깁니다.** 자리는 `primeHost.ts:27`과 `selectChildren.ts:148`입니다. 이 비용은 측정기가 표본마다 `globalThis.gc()`를 강제할 때 마운트 직후 첫 쓰기에 몰려 나타나며, 첫 쓰기에 +1.5~2 µs입니다. gc를 강제하지 않으면 쓰기당 0.1~0.3 µs입니다.
2. **1b의 oneOf-10 OFF 마운트 회귀는 V8 최적화 단계의 문제입니다.** 계획 경로가 쓰기에서 `flushPendingGateReads` 호출을 없애므로(쓰기당 128/64/64회 → 0회), 마운트에서만 불리는 160회로는 이 함수가 Maglev·TurboFan으로 올라가지 못합니다. 그래서 마운트의 호출당 비용이 0.067 µs에서 0.206 µs로 늘어, 마운트 1회가 +10~21 µs 느려집니다.
3. **변경 2의 if-then OFF 이후 갱신 회귀는 재현되지 않았습니다.** 그 행에서 실행되는 일의 양이 HEAD와 같고, 짝 비교에서는 오히려 −0.08~−0.83 µs 빨랐습니다. 오탐으로 판단합니다. 1b의 array-100 이후 갱신도 바뀐 코드가 실행되지 않는 행이며, 원문만 다른 HEAD 복사본과 같은 범위였습니다.
4. **측정 방법의 치우침이 있습니다.** A/A 기준선은 바이트가 같은 `b-head` 두 개로 만듭니다(`core.mjs:18-23`). 같은 원문은 V8 컴파일을 공유해서 두 쪽이 모두 약 4% 빠르게 돕니다(if-then OFF 마운트 516 대 540 µs, 이후 갱신 34.5 대 36 µs). 그 결과 원문이 다른 두 번들을 비교할 때의 기준선을 낮게 잡습니다.

## 근거

- **호출 횟수(쓰기 1회당).**
  - if-then OFF/ON: 1b는 `getDirectChildSelectionPlan` 호출만 2회/3회 늘고, 나머지는 HEAD와 같습니다. 이 함수는 null을 캐시하지 않습니다(`getDirectChildSelectionPlan.ts:46`의 `return null`에 `PLANS.set`이 없음).
  - if-then에서 변경 2: 모든 계수가 HEAD와 같습니다. `readProjectedValue`의 경로가 빈 문자열이라 `pathSegments` 호출 전에 반환하고, `resolveRead`는 0회입니다.
  - array-100: `selectChildren`, `primeHost`, 계획 함수, 게이트 함수가 모두 0회입니다.
- **할당.** if-then에서 1b는 쓰기당 −168 B(for-of 반복자가 없어짐), 변경 2는 쓰기당 +16 B와 마운트당 +432 B(GateRegistry의 Map 2개)입니다. 할당은 회귀를 설명하지 못합니다.
- **V8 동작**(`--trace-opt --trace-deopt --trace-turbo-inlining`).
  - 바뀐 함수에 탈최적화나 인라인 결정의 차이가 없습니다. `selectChildren`과 `primeHost`는 세 판 모두에서 끝까지 컴파일되지 않습니다.
  - 모든 판에서 gc()마다 "embedded weak objects cleared"로 `set active`가 탈최적화되고, `captureSchemaNodeChange`가 최대 80회 다시 최적화됩니다. HEAD에도 있는 소음원입니다.
  - oneOf-10의 `flushPendingGateReads`는 HEAD에서 예열 중 Maglev, 표본 91에서 TurboFan으로 올라갑니다. 1b에서는 121개 표본 동안 한 번도 컴파일되지 않습니다.
- **기여도 분리**(한 프로세스, 순서 교대, 600표본, if-then OFF 첫 갱신, 변형 − HEAD, µs).
  - 원문만 다른 HEAD 복사본(headx): +0.0~0.4
  - 1b: +1.7~2.2
  - primeHost를 인덱스 루프로만 바꿈: 0.5
  - primeHost에 계획 호출만 더함: 1.1~1.8
  - 아무 일도 하지 않는 함수 호출: 1.6
  - WeakMap.get을 호출 없이 인라인: 0.4
  - `--no-gc`로 돌리면 1b는 첫 갱신 +0.03, 이후 갱신 +0.25이고, 빈 함수 호출 변형은 headx와 같았습니다(3회 중 3회).
- **1b oneOf-10 OFF 마운트**: +14.7 / +10.3 / +21.1 µs입니다(같은 실행의 headx는 +2.1 / +4 / +11.8). 마운트만 따로 돌리면 차이가 없습니다(1300.75 대 1304.37 µs).

## 고침 명세

- **F1(1b, 비합집합 호스트의 쓰기당 함수 호출 제거).** 이후 방문은 함수 호출 없이 WeakMap 조회만 합니다. 메모리는 게이트가 있는 비합집합 호스트마다 null 항목 하나이며, 청사진과 함께 사라집니다. 분기당 절감은 그대로입니다.
  1. `getDirectChildSelectionPlan`이 null 결과도 캐시합니다.
  2. 캐시를 이름 있는 내보내기로 둡니다.
  3. `primeHost.ts:27-28`과 `selectChildren.ts:148-149`는 캐시를 먼저 읽고, 값이 없을 때만 함수를 부릅니다.
- **F2(1b, oneOf-10 마운트).** `selectChildren.ts:156`이 `flushPendingGateReads`를 `context.pendingOutputs?.size`가 있을 때만 부르게 합니다. 이 조건은 `flushPendingGateReads.ts:36`의 즉시 반환 조건과 같아서 동작이 동일합니다. 마운트당 102회의 호출과 경로 문자열 생성이 사라집니다. 남은 58회는 여전히 최적화되지 않은 채 돌 수 있어, 회귀를 모두 없애는지는 확인하지 않았습니다.
- **F3(변경 2, 선택).** `getGateRegistry.ts:40,42`의 Map 두 개를 처음 쓰일 때 만듭니다. 필드는 생성자에서 `undefined`로 두어 객체 모양을 지킵니다. 마운트당 −432 B입니다.
- **F4(측정기).** A/A 기준선에는 원문이 다른 HEAD 복사본(끝에 주석 한 줄을 더한 번들)을 씁니다. 마운트 직후 첫 쓰기 행은 gc 있음과 없음 두 조건으로 함께 보고합니다.

## 확인하지 못한 것

- 아무 일도 하지 않는 호출 하나가 왜 gc()가 있을 때에만 첫 쓰기에 1.5 µs를 더하는지는 밝히지 못했습니다. 바이트코드·기준 코드 비우기는 원인이 아닙니다. 가설은 gc() 뒤의 약한 참조 정리와 재최적화 작업이 첫 쓰기 구간에 들어온다는 것입니다.
- 1b의 if-then ON 행은 300표본에서 A/A 소음(±3 µs)과 구분되지 않았습니다. 같은 경로이므로 같은 원인으로 추정합니다.
- 변경 1(마운트 때 계획)은 비교하지 않았습니다.
