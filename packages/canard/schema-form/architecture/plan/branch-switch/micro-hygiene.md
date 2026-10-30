# 미시 위생 — 소유자의 다섯 가지 수정 지시 (2026-10-29, 별도 PR)

## 자리

Ⅳ-2가 미채택으로 닫히는 시점에 소유자가 "속도 문제는 아닌데, 이후 수정 지시를 하고 싶은 게 있어. 적어두던가, 별도 PR로 올려서 수정해줬으면 해"라며 다섯 항목을 지시했다. 기능을 바꾸지 않는 정리이며, 설계 Ⅳ의 단계와 독립된 **별도 PR**로 진행한다. 착수는 Ⅳ-2 기록 PR 병합 뒤다. 소유자의 말: "맥락을 먼저 파악하고 작업은 지금 작업 후에 해도 된다. 기능을 바꾸는 건 아닐 거라서."

## 항목(소유자의 말 그대로 요약)

1. **jsonPointer 리터럴의 enum 사용.** `src/helpers/jsonPointer/utils/parsePointerSegments.ts`, `parseStandardPointer.ts` 등에서 `'/'`, `'#'`, `'#/'`, `'~'` 같은 포인터 문자열 리터럴을 직접 쓰는 곳을 `constants/JSONPointer.ts`·`PointerOperator.ts`의 상수를 쓰도록 고친다. 소유자는 "누락인 걸로 보여"라고 했다. 시작점은 두 파일의 14·16·28·29행과 23~31행이며, `src/helpers/jsonPointer` 전체와 엔진 안의 포인터 리터럴을 함께 훑는다.
2. **`includes` 대신 `indexOf() === -1`.** "크게 차이는 안 나도 이게 속도차가 꽤 났던 걸로 기억해. 유의미하게 차이가 나지 않는다면 편의를 위해 안 써도 되지만, 누적되면(특히 호출량이 많으면) 꽤 차이가 나서." 현재 `src`에서 시험 밖의 `.includes(` 호출은 129곳이다. 호출량이 많은 경로(정착·쓰기·포인터 해석)부터 바꾸고, 한 번만 불리는 설정·청사진 분석 경로는 소유자의 허용대로 편의를 우선할 수 있다. **함수형 체이닝**이 있으면 단일 `for`/`while`로 바꾼다("함수형 체인보다 for-loop을 더 좋아하는 것과 같은 이치").
3. **임시 Set·Map의 배열 대체 검토.** "Set이랑 Map은 생성 비용이 꽤 비싸서, 재사용을 전제로 만드는 게 아니면 생성과 삭제를 반복하는 게 GC를 자극해. 임시로 쓰고 제거되는 경우에는 크기가 10,000을 넘지 않으면 array가 O(n)임에도 더 빠른 경우가 있었어." 현재 `src/core`에서 시험 밖의 `new Set`/`new Map`은 418곳이다. 각 지점을 (가) 트리·청사진 수명의 상주 구조, (나) 정착 scratch로 이미 재사용되는 구조, (다) 한 호출 안에서 만들고 버리는 임시 구조로 나누고, (다)만 대상으로 한다. **Ⅳ-2의 사실을 함께 적어 둔다**: 전환 경로에서 쓰기당 Map/Set 생성을 97 → 37로 줄여도 oneOf-80·siblings-0의 시간은 폭 안이었다(`design-iv.md`의 "Ⅳ-2가 남긴 사실"). 그러므로 이 항목의 기대는 전환 행의 시간이 아니라 GC 압력과 고빈도 쓰기 행(가중치 3,000~5,000)의 누적이며, 판정은 가중 교환비 창으로 한다.
4. **두 항 비교는 `minLite`/`maxLite`.** `src/core/engine/derive/evaluateDeriveRound/utils/rank/compareDeriveWrites.ts` 등에서 두 수의 `Math.min`/`Math.max`는 `@winglet/common-utils/math`의 `minLite`/`maxLite`(두 수 전용 가속 함수)로 바꾼다. 현재 시험 밖의 `Math.min(`/`Math.max(`는 32곳이다. "이런 common-utils의 최적화 도구들을 좀 썼으면 좋겠어."
5. **배열 메서드 대신 `for`-loop 또는 common-utils의 `forEach`.** `parent.childEntries.forEach` 같은 호출은 `@winglet/common-utils/array`의 `forEach`(`packages/winglet/common-utils/src/utils/array/forEach.ts`)나 `for`-loop으로 바꾼다. `map`/`filter`도 같다("반복문 이터레이션이 좀 느려서"). 현재 시험 밖의 `.forEach(`/`.map(`/`.filter(`/`.reduce(`/`.some(`/`.every(` 호출은 351곳이다. common-utils의 `array/` 도구 목록: `at`, `chunk`, `difference*`, `filter`, `forEach`, `forEachDual`, `forEachReverse`, `groupBy`, `intersection*`, `map`, `orderedMerge`, `primitiveArrayEqual`, `sortWithReference`, `unique*`.

6. **`Record<string, …>` 대신 `@aileron/declare`의 유틸리티 형.** "`Record<string, BlueprintSchema>` 대신 `Dictionary`라는 유틸리티 타입을 쓰도록 해. `import type { Dictionary, IsNullable, Roll } from '@aileron/declare';` 여기 다양한 유틸리티 타입들을 미리 만들어둬서, 불필요한 재사용 하지 말고 이 타입을 주력으로 쓰길 바라." 현재 시험 밖의 `Record<string` 선언은 142곳이고 `@aileron/declare`를 이미 가져오는 파일은 81개다. `@aileron/declare`가 제공하는 형: `Dictionary`, `StringDictionary`, `DeepRequired`, `Nullish`, `Nullable`, `IsNullable`, `Optional`, `PickRequired`, `PickPartial`, `OmitRequired`, `OmitPartial`, `PickAndPartial`, `RequiredBy`, `PartialBy`, `Roll`, `Expand`, `ExpandRecursively`, `WithKey`, `ElementOf`, `Params`, `Parameter`, `SetStateFn` 등. `Record<string, T>`는 `Dictionary<T>`로, 손으로 쓴 `T | null | undefined`·`Partial`·`Required` 조합은 대응하는 유틸리티 형으로 바꾸고, 공개 선언(`index.d.ts`)의 바이트가 바뀌면 그 차분을 결과 문서에 기록한다(형 별칭 치환은 선언 출력이 바뀔 수 있으므로 "선언 차분 0" 관문은 이 항목에 한해 "의미 동등 확인"으로 대체한다).

## 규칙

- 공개 동작 불변: 값·키 순서·같은 값은 같은 참조·이벤트·배달 비교(코퍼스 차이 0)·`inactiveValues`·B11·B12. 공개 선언 차분 0. 시험의 삭제·약화 0.
- 각 항목은 별도 커밋(항목 3은 묶음 단위로 여러 커밋 가능)이며, DETAIL에 적힌 비용 문장이 바뀌면 DETAIL을 먼저 고친다.
- 항목 2·5는 정착·쓰기·포인터 해석·배달의 고빈도 경로를 우선한다. 한 번만 불리는 경로는 소유자의 허용대로 두어도 되며, 둔 곳은 결과 문서에 한 줄로 적는다.
- 항목 3은 (다) 임시 구조만 대상으로 하고, 바꾼 지점마다 "크기 상한의 근거"(엔트리 수·게이트 수·배달 후보 수 가운데 무엇에 비례하는지)를 적는다. 상한을 말할 수 없는 지점은 바꾸지 않는다. 소유자의 선별 기준(2026-10-30): "값을 재활용하면서 읽기와 쓰기가 많은 경우엔 Map/Set이 유리하고, 한 번 쓰고 버리는 경우는 array를 쓰는 게 유리하다. 한 번 써도 n²이나 n³처럼 비교량이 폭증하면 또 Set이 유리하다." 그러므로 임시 구조마다 접근 패턴을 적는다: 멤버십 조회 횟수가 원소 수에 비례하면(중첩 비교) Set/Map 유지, 단일 순회 뒤 버리는 작은 구조만 배열, 상한 불명은 유지. 분류표의 각 행은 접근 패턴·크기 상한 근거·판단(배열로 바꿈 / Set 유지 / 상한 불명)을 한 줄로 가진다.
- 새 상주 구조 없음. 새 공개 API 없음.

## 검증

- 정적 관문: build, 시험 다섯 프로젝트 순차 `--run`, `test:verify --run`, 선언 차분 0, 격리 시험, 배달 코퍼스 79장면 + B12 7장면 차이 0, FCA findings 202 유지.
- 창 하나: A(단계 머리) 대 B(후보), 22행·레인당 10프로세스·20/100·legacy, Node/Bun 힙. 판정은 `verification.md`의 가중 교환비 절 그대로(보호 행 폭 밖 퇴보 0, 가중 교환비 ≤ 0이면 병합, 개선이 있으면 기록). 이 PR은 속도를 약속하지 않으므로 교환비 0도 병합한다(소유자: "속도 문제는 아닌데"). 단 폭 밖 퇴보가 하나라도 있으면 그 커밋을 되돌린다.
- 독립 검토 1회(claude 검증 에이전트): 동작 불변, 항목 3의 상한 근거, 항목 2·5에서 반복 의미가 바뀐 곳(희소 배열·`undefined` 건너뛰기·`this` 바인딩) 0건.

## 순서

Ⅳ-2 기록 PR 병합 → 이 PR(브랜치 `chore/schema-form-micro-hygiene`, codex 워커, 결과 `../../verification/branch-switch/micro-hygiene-results.md`) → 설계 Ⅳ-3-0(프로파일)은 이 PR의 병합 머리 위에서 시작한다. 두 작업을 같은 창에 섞지 않는다.
