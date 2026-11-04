# 미시 위생 후보 8d7d1a87e 독립 검토 (1c3655a10..8d7d1a87e)

## 판정

conditional PASS입니다(P1 0건, P2 1건, P3 5건). 관측 가능한 동작 변화와 시험 약화는 찾지 못했습니다. 병합 조건은 두 가지입니다. 첫째, 아래 P2의 비용 기록을 결과 문서에 더해야 합니다. 둘째, 진행 중인 가중 창이 폭 밖 퇴보 0으로 끝나야 합니다.

## 발견

### P2-1 (확인됨): 항목 5가 만든 비용이 어디에도 기록되지 않았습니다.

- 위치: 커밋 af3e2e1d3 전체. 대표 예시는 `src/core/engine/settle/utils/compute/childSelection/getDirectChildSelectionPlan.ts:80`의 세 겹 즉시 실행 화살표와 `src/core/engine/blueprint/collectBlueprintWarnings/utils/collectInlineTerminalWarnings.ts:121·130`의 `void pending.push`와 효과 없는 `continue iterate;`입니다.
- 결함: 229곳이 즉시 실행 화살표 132개, 원소마다 실행되는 `index in items` 검사 135개 이상, 효과 없는 `continue iterate;` 16개, `const index = position;` 같은 별칭 줄 25개로 바뀌었습니다. 줄 수는 3,687줄 추가와 683줄 삭제입니다. 커밋된 빌드 로그 기준으로 index.mjs는 830,373바이트에서 861,528바이트로 31,155바이트(3.75 %) 늘었고, index.cjs는 847,915바이트에서 882,316바이트로 34,401바이트 늘었습니다. 엔진이 push로 만든 배열에는 구멍이 생길 수 없으므로 검사 대부분은 막아 주는 경우가 없습니다. 패키지 CLAUDE.md는 "every change states its speed and memory cost"를 요구하지만 결과 문서의 항목 5 절은 이 비용을 적지 않았습니다.
- 실패 시나리오: 고빈도 쓰기 행에서 작은 퇴보가 나와도 그 원인이 이 검사와 즉시 실행 함수인지 가를 기록이 없습니다. 소유자가 읽는 정착 코드에는 세 겹 즉시 실행 함수가 그대로 남습니다.
- 수정 사양(필수): `architecture/verification/branch-switch/micro-hygiene-results.md`의 항목 5 절 끝에 문단 하나를 더합니다. 세 번들의 기준 바이트와 후보 바이트 표, 즉시 실행 화살표 132개와 `in` 검사가 원소마다 실행된다는 문장, 창이 그 비용을 판정한다는 문장을 적습니다. 확인 명령: `git -C packages/canard/schema-form show af3e2e1d3 --format= -U0 -- src ':!src/**/__tests__/**' | grep -cE '^\+.*\(\(\) => \{'` 가 132를 내면 됩니다.
- 수정 사양(소유자 결정): 엔진이 만든 배열에서 `in` 검사, 별칭 줄, 효과 없는 `continue iterate;`를 지우고 즉시 실행 함수를 일반 루프와 불리언 변수로 펴는 정리를 별도 커밋으로 할 수 있습니다. 이 정리를 하면 정적 관문과 창을 다시 돌려야 합니다.

### P3-1 (확인됨): 항목 1에서 엔진의 루트 포인터 빈 문자열 7곳이 상수로 바뀌지도, 유지 목록에 오르지도 않았습니다.

- 위치: `core/engine/blueprint/buildNodes/utils/gates/collectGateEvaluationReads.ts:23`, `core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:70`, `core/engine/settle/utils/templatePaths/intersectsWatchedPath.ts:25`, `core/engine/settle/utils/templatePaths/expandTemplatePaths.ts:34`, `core/engine/validation/utils/route/routeValidationIssues.ts:81`, `core/engine/validation/utils/route/normalizeValidationIssue.ts:22`, `core/engine/blueprint/blueprint.ts:82`.
- helpers에서는 같은 뜻의 `''`를 `$.Root`로 바꿨으므로 한 패키지 안에 두 표기가 섞이고, 결과 문서의 유지 목록이 완전하다는 주장이 틀립니다.
- 수정 사양: 7곳을 `$.Root`로 바꾸고 `@/schema-form/helpers/jsonPointer`에서 `JSONPointer as $`를 가져옵니다. 바꾸지 않을 곳은 결과 문서 유지 목록에 이유와 함께 적습니다.

### P3-2 (확인됨): `bindPointerTemplate.ts:20`의 `let bound = $.Root;`와 `joinPointer.ts:14`의 `let path = $.Root;`는 선언 형이 string이 아니라 리터럴 `""`입니다.

- 루프 안의 `+=`가 읽기 형을 넓혀 주기 때문에만 컴파일됩니다. 이후 일반 대입을 넣으면 TS2322가 납니다. 같은 커밋이 다른 파일에서는 `let prefix: string = $.Fragment;`로 형을 적어 두어 표기도 어긋납니다.
- 수정 사양: 두 줄을 `let bound: string = $.Root;`와 `let path: string = $.Root;`로 바꿉니다.

### P3-3 (그럴듯함, 성능): 리터럴 `'#/'` 하나가 호출마다 실행되는 `$.Fragment + $.Separator` 결합으로 바뀌었습니다.

- 위치: `helpers/jsonPointer/utils/parsePointerSegments.ts:31`, `readFormattedPointerSegment.ts:18`, `resolvePointer.ts:25`. readFormattedPointerSegment는 readPointerSegment를 거쳐 정착 경로에서 자주 불립니다. 최적화 단계가 이 결합을 상수로 접지 못하면 호출마다 두 글자 문자열을 할당합니다.
- 수정 사양: 세 파일 각각의 모듈 머리에 `const FRAGMENT_PREFIX = $.Fragment + $.Separator;`를 두고 startsWith의 인수로 씁니다.

### P3-4 (확인됨): `core/engine/blueprint/DETAIL.md:39`가 아직 "기존의 some·indexOf 검사"라고 적습니다.

- readAllowedTypes.ts의 `some`은 항목 5에서 인덱스 루프로 바뀌었으므로 문장이 현재 코드와 다릅니다.
- 수정 사양: 그 구절을 "기존의 인덱스 순회·indexOf 검사"로 바꿉니다.

### P3-5 (확인됨, 동작 영향 없음): 결과 문서는 희소 입력을 `index in`으로 보존했다고 적지만 두 곳은 `for...of`로 바뀌어 구멍도 방문합니다.

- 위치: `core/engine/settle/utils/loadValues/setLoadValue.ts:23`, `core/engine/write/utils/chain/flushBatchWrites.ts:25`. 입력이 parsePointerSegments의 분할 결과와 push로만 채우는 batchWrites라서 구멍이 없으므로 관측 차이는 없습니다.
- 수정 사양: 결과 문서 항목 5 절에 두 곳과 밀집 근거를 한 문장으로 적습니다.

## 확인한 것

- 항목 1: 상수 값을 winglet 정의까지 따라가 Root는 빈 문자열, Fragment는 `#`, Separator는 `/`임을 확인했습니다. 추가된 상수 참조 110개는 리터럴 107개에 `#/`를 두 상수로 쓴 3곳을 더한 수와 맞습니다. 잘못 고른 상수는 없고 `~0`·`~1` 이스케이프는 손대지 않았습니다.
- 항목 2: 텍스트 기준 includes는 86개에서 37개가 되었고, 주석 2개를 빼면 AST 기준 84개에서 35개와 맞습니다. 49곳의 비교 대상은 문자열, 노드, 기호, 엔진 숫자 ID입니다. 숫자 하나는 정규식으로 검증된 분기 위치라 NaN이 들어올 수 없습니다. 부정 방향은 49곳 모두 맞습니다. 사슬 4곳은 순서, 조기 종료, 결과가 같습니다. selectEffectiveDeclarations의 정렬 비교는 id로 끝나는 전순서라 정렬 전 순서 차이가 결과에 남지 않습니다.
- 항목 3: new Set과 new Map 422개를 grep으로 재현했고, 원시 기록의 이유 분포 229·170·22·1이 230·170·22와 맞습니다. dirtyChildren은 중복 제거와 첫 등장 순서가 같고, 결과 배열은 구성 중 검사에만 쓰여 별칭 위험이 없습니다. 새 시험 4건 가운데 1개와 64개 경우 2건이 변경 없이는 Set 생성 1회로 실패하고, 나머지 2건은 특성화 시험입니다. 230곳 중 1곳만 바꾼 것은 계획에 맞지만 보수적입니다.
- 항목 4: minLite와 maxLite는 두 인수 비교 구현이고 math 내보내기가 있습니다. 14곳은 길이, 색인, 도장, 순위, Infinity 기본값이라 NaN과 -0이 생기지 않습니다. fillArraySlot은 NaN이어도 Array.from 길이가 0으로 같습니다.
- 항목 5: 중단 의미가 있는 common-utils forEach는 쓰지 않았습니다. map과 filter의 입력은 엔진이 만든 밀집 배열입니다. 작성 값 입력인 populateNodeChildren의 controls.fields는 기준에서도 collectSchemaCapabilities가 구멍에서 TypeError를 내므로 차이가 없습니다. 약 170곳을 읽었고 단락, 부정, `?.`의 undefined 결과, this, forEach 안 return의 라벨 continue 변환, 이름 가림이 모두 원래와 같았습니다. function 콜백은 없었습니다.
- 항목 6: 선언 정의와 개수 101·284·122·13·1을 diff로 재현했습니다. any로 넓어지는 인수 없는 Dictionary는 없습니다. 스냅숏 변경은 정확히 4줄이고 형이 같습니다. 선언 파일의 @aileron 가져오기는 dist 안 사본 경로로 바뀝니다.
- 전역: 시험 삭제, 약화, skip이 없습니다. index.ts, __legacy__, 다른 패키지는 바뀌지 않았습니다. as any, as never, 린트 억제 주석은 추가되지 않았습니다. 압축 로그까지 로컬 경로가 없고, 커밋에 공동 저자나 세션 줄이 없습니다.

## 미확인

지시에 따라 tsc, 빌드, 시험, 창을 직접 돌리지 않았으므로 통과 여부는 커밋된 로그에 의존합니다. 항목 5의 나머지 약 60곳과 항목 6의 521곳 대부분은 개수와 표본으로만 확인했습니다. 선언 동등 비교, 형 지우기 비교, FCA 202건, 배달 코퍼스, 격리는 다시 돌리지 않았습니다. 작업 트리에는 창 절을 고친 결과 문서와 preflight 디렉터리가 커밋되지 않은 채 있으며, 커밋된 판만 검토했습니다.

## 실행한 명령

git log, show, diff, grep, ls-tree, status, rev-parse와 grep, sed, cat, wc, awk, sort, uniq, paste, cut, ls, head. 커밋된 압축 로그 3개는 gzip -dc로 읽었습니다. node, yarn, tsc는 실행하지 않았고 파일도 쓰지 않았습니다.
