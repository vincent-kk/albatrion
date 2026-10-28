# 설계 Ⅱ의 결함 수정 — 경로 문법의 단일 해석기(B6)와 배열의 kept 아이템 압축 복원(B7)

## 자리

460라운드에 소유자가 458C-05의 기존 결함 후보 둘을 결함으로 정하고 수정안을 승인했다(`reviews/round-460-owner-answers.md`). 둘을 고친 뒤 설계 Ⅱ를 이정표(B5 마감)로 찍고, 설계 Ⅲ의 착수 여부는 소유자가 따로 정한다. 이 문서는 두 수정의 계약과 관문을 고정하며, 결정의 정본은 460라운드 문서와 원장이다.

## 문제

- **(b) 예약 토큰과 같은 이름의 키.** 경로 조회는 세그먼트를 unescape하기 전에 `*`(와일드카드)·`..`(부모)·`.`(현재)·`@`(컨텍스트)와 비교하므로, 이 넷을 이름으로 가진 속성은 문자열 경로로 가리킬 수 없다. B4-2까지 남겨 둔 별표 호환 장치는 이름으로 만든 경로 문자열을 `find`로 되읽어 "살아 있는 노드가 있으면 공표하지 않음"을 판정했고, 그 `find`가 리터럴 `*`를 와일드카드로 읽어 값이 `inactiveValues`에서 숨겨지고 항목 참조가 alias되었다(전용 20파일 1,275줄, 공유 파일 47개의 분기 168곳). 경로의 분할·토큰 판정·이스케이프·조립은 약 60개 파일에 흩어져 있다(`split` 34파일, 토큰 비교 35파일, `startsWith(path + '/')` 34곳).
- **(a) 지워지는 배열 아래의 keep 자손.** `unsetOnInactive: true`인 배열 호스트가 나갈 때, 자손의 명시 `unsetOnInactive: false`를 객체 호스트는 지키고(닫힌 동안 공표, 재진입에 복원) 배열 호스트는 지키지 않는다. 후보 소유 범위가 없는 배열은 자식을 보지 않고 슬롯을 버리며, 후보 소유 배열은 살아 있던 아이템에 강제 지움을 넘기고 이미 비활성이던 keep 원본만 숨은 운반자로 남겨 `inactiveValues`에만 보인다. 어느 경우든 재진입 길이는 0이다. 458C-05의 "후보 소유 배열은 keep 자손을 남긴다"는 이 "보이기만 함"의 과대 서술이다.

## B6 — 경로 문법의 단일 해석기와 예약 토큰의 리터럴 표기

### 세그먼트 해석 규칙(세 줄)

1. 세그먼트가 정확히 `*`·`..`·`.`·`@`이면 연산자다(각각 와일드카드·부모·현재·컨텍스트).
2. 세그먼트가 그 연산자의 RFC 6901 §6 퍼센트 표기와 정확히 같으면(`%2A`·`%2E%2E`·`%2E`·`%40`) 그 글자를 이름으로 가진 리터럴 키다.
3. 그 밖의 세그먼트는 지금처럼 `~1`→`/`, `~0`→`~`만 풀어 이름으로 쓴다. `%`를 품은 보통 이름은 바뀌지 않는다.

`#`은 경로 맨 앞에서만 fragment 접두사이며 중간 세그먼트의 `#`은 보통 이름이다. 슬래시 하나(`/`)와 fragment 뒤 슬래시 하나(`#/`)는 어디서나 RFC 6901대로 "구분자 + 빈 이름", 곧 루트 바로 아래의 빈 문자열 키이고, 루트 표기는 `''`와 `#` 둘뿐이다(소유자 결정, 460라운드; 계획서 초판이 `#/`를 루트로 적은 것은 오기): 검증 라우팅의 루트 별칭(`normalizeIssueDataPath`)과 `stripFragment`의 `/`·`#/` 루트 정규화는 지우며, 바뀌는 공개 동작은 `fieldInputMap['/']`이 빈 이름 키를 뜻하게 되는 것과 루트를 `/`로 적는 검증기 오류가 루트에 붙지 않는 것 둘이다(출하된 검증기 플러그인은 루트를 `''`로 적는다). 새 이스케이프(`~2` 류)는 만들지 않는다. 이름이 정확히 `%2A`·`%2E`·`%2E%2E`·`%40`인 키는 문자열 경로로 가리킬 수 없게 되는데, 이는 문서에 적는 알려진 한계다(`docs/en/SPECIFICATION.md`의 JSONPointer System 절).

### 소유 fractal과 계약

`src/helpers/jsonPointer`가 경로 문자열의 유일한 해석기·조립기가 된다. 새 계약(이름은 구현에서 형제 관례에 맞춰 확정하되 역할은 아래와 같다):

- `parsePointer(pointer)` — 문자열 또는 세그먼트 배열을 받아 `{ absolute, segments }`를 돌려준다. `segments`의 원소는 이름 문자열(디코드 완료) 또는 연산자 상수 넷 가운데 하나이며, 연산자는 고유 심볼이라 `typeof segment === 'symbol'`과 항등 비교로 가른다. 이름 세그먼트에는 디코드가 필요한 글자(`~`·`%`)가 없으면 원문 문자열을 그대로 둔다(할당 없음).
- `parseStandardPointer(pointer)` — RFC 6901 그대로의 포인터(AJV `instancePath` 같은 외부 생산자의 경로)를 연산자 없이 이름만의 세그먼트로 푼다. fragment 형식(`#/...`)은 §6대로 세그먼트 전체를 퍼센트 디코드한다. 검증 이슈 라우팅과 `$ref` 해석은 이 함수를 쓴다. 이름이 `*`인 속성의 AJV 오류 경로 `/*`가 와일드카드로 읽히지 않게 하는 장치다.
- `formatSegment(name)` — 이름을 세그먼트 표기로 만든다: `~`→`~0`, `/`→`~1`, 이름이 정확히 `*`·`..`·`.`·`@`이면 퍼센트 표기. 노드 `path`, `inactiveValues[].path`, 소비자에게 내보내는 오류 경로는 모두 이 함수로 만들어 `find(entry.path)`가 되돌아온다. 보통 이름의 경로는 지금과 글자 하나 다르지 않다.
- `appendSegment(parentPath, name)`·`joinPointer(segments)` — 경로 조립. `isDescendantPath(path, ancestorPath)` — 하위 경로 포함 검사(`startsWith(path + '/')` 34곳의 대체). `resolvePointer(basePath, pointer)` — `../`·`./`·`#/`·절대 경로를 기준 경로에 대해 푼다(`getAbsolutePath`와 `resolveDependencyPath`·`collectGateEvaluationReads`의 중복 구현을 하나로).
- `stripFragment`는 유지한다. `ESCAPED_SLASH_REGEX`·`ESCAPED_TILDE_REGEX`·`SLASH_REGEX`·`TILDE_REGEX`는 fractal 밖으로 내보내지 않는다. 이스케이프의 구현은 `@winglet/json/pointer-escape`를 재사용한다.
- 공개 `src/index.ts`는 바뀌지 않는다(`JSONPointer` 상수는 그대로, 새 함수는 내부 계약).

### 격리 규칙

`src/helpers/jsonPointer` 밖의 제품 코드는 경로 문자열에 대해 `split`, `'/'`·`JSONPointer.Separator` 결합, `~0`·`~1` 정규식, 원문 문자열과 `JSONPointer.Wildcard`·`Parent`·`Current`·`Context`의 비교를 하지 않는다. 토큰 판정은 파싱된 세그먼트의 연산자 항등 비교로만 한다. 이 규칙은 `src/__tests__/importModel.test.ts`와 같은 자리의 정적 검사 시험(제품 소스를 훑어 금지 패턴을 찾고, 허용 목록은 `helpers/jsonPointer` 하나)으로 고정한다. `src/__legacy__`는 범위 밖이다.

### 별표 호환 장치의 제거

`settle/utils/literalStar/`·`literalStarStore/` 전부, 공유 파일의 분기 168곳, 청사진의 `containsLiteralStar`와 `markCandidateDescendants`의 별표 분기를 지운다. 이름이 `*`인 키의 폼은 일반 슬롯 경로를 탄다. 공개 기대값이 바뀌는 곳은 `*`를 `*x`로 바꾼 사본으로 관측한 네 파일 11건이다: `surface.slots-wildcard-publication`(3, 숨김 해제), `surface.slots-wildcard-lifetimes`(5, 숨김 해제와 항목 참조 정체성의 일반 규칙), `surface.slots-wildcard-packed-array`(2, 재진입 복원 값이 원본 `held`에서 마지막 패치 값 `patched`로), `surface.slots-wildcard-policies`(1, 비활성 그룹 아래 `keep=true` 자손이 지워지지 않고 남음). 뒤의 둘은 숨김과 다른 장치 고유 의미의 차이이며, 일반 슬롯 경로의 결과(마지막 쓰기 복원, keep 지시 준수)를 올바른 쪽으로 본다(460C-03). 장치 자체를 고정한 시험(`literalStarStore/__tests__/setLatentRaw.test.ts`, `settle.retained-slot-wildcard.test.ts`의 장치 진입 케이스, `markCandidateDescendants.literalStar.test.ts`)은 지우고, 장치 내부를 참조하던 시험(`settle.array-clear`·`settle.scalar-latent-scope`·`settle.retained-slot-capture`·`settle.latent-candidate-ownership-policy`)은 공개 관측 단언으로 옮기거나 장치 목적 단언이면 지운다(459C-03 규칙).

### 비용 문장

파싱은 `split` 한 번과 세그먼트당 비교 넷으로 지금과 같은 차수이고, 디코드는 `~`·`%`가 있는 세그먼트에서만 일어난다. 별표 장치 제거로 모든 폼에서 분기 168곳의 조건 검사가 사라진다. 할당은 지금의 `split` 결과 배열 하나와 같다.

## B7 — 배열의 kept 아이템 압축 복원

### 계약

배열 호스트가 지움(자기 `unsetOnInactive: true` 또는 상속된 지움)과 함께 나갈 때:

- 서브트리에 명시 keep 원본(`unsetOnInactive: false`이고 raw가 정의된 노드; 그 노드 자신이 아이템이어도 됨)을 하나라도 가진 아이템만 살아남는다. 살아남은 아이템은 원래 순서로 앞에서부터 채워지고(압축), 배열 길이는 살아남은 아이템 수다.
- 살아남은 아이템은 객체 호스트가 자식에게 적용하는 것과 같은 규칙으로 kept 원본만 품는다. 나감 시점에 그 keep 노드가 살아 있었든 이미 비활성이었든 같다.
- 닫힌 동안 `inactiveValues`는 압축된 색인으로 kept 원본을 공표한다(`/list/0/keep`). 재진입은 압축된 배열을 복원한다. 비활성이던 keep 원본은 재진입 뒤에도 자기 조건이 참이 될 때까지 비활성 슬롯에 남아 `inactiveValues`에 보인다(B4-2의 비활성 쓰기 규칙).
- 후보 소유 범위의 유무로 동작이 갈리지 않는다(`hasSlotCandidateOwner`와 숨은 운반자 `retainClearedArrayCarriers`는 소비처가 없어지면 지운다). 중첩 배열은 같은 규칙을 재귀한다. 객체 호스트의 동작은 바뀌지 않는다. keep 자손이 하나도 없는 배열은 지금처럼 길이 0이다.

### 구현 방향(구속하지 않음)

overlay의 자식 패치는 청사진 엔트리로 키를 매기므로 같은 템플릿의 아이템을 개별로 가리킬 수 없다. 따라서 나감 시점에 살아남은 아이템의 보존 값을 실체화해 overlay의 `raw`(압축 배열)와 `itemCount`로 두고, 재진입은 그 값으로 배열을 다시 세우는 쪽이 자연스럽다. `createExitSlotOverlay`의 "지움 + 배열 + 후보 소유자 없음" 조기 반환과 아이템에 넘기는 강제 지움을 이 규칙으로 바꾼다.

### 바뀌는 문서와 시험

`src/core/engine/settle/DETAIL.md`의 배열 지움 문장(현재 "pre-existing inconsistency … owner decision")을 코드보다 먼저 이 계약으로 바꾼다. `settle.retained-slot-array-policy.test.ts`는 현재 동작을 고정한 시험이므로 기대값을 이 계약으로 고쳐 쓴다(add-only 핀이 아니라 계약 시험으로). 수정 전에 실패하는 새 시험: 단일 후보 배열에서 살아 있던 keep, 이미 비활성이던 keep, 스칼라 keep 아이템, 후보 소유 배열, 중첩 배열, keep 없는 배열(길이 0 유지), 객체 호스트 불변.

### 비용 문장

지움이 적용되는 배열 나감에서만 아이템 수에 비례한 방문이 추가된다. 지움이 없는 나감과 객체 호스트의 나감은 호출 수가 같다(호출 수 시험으로 고정).

## 관문 — PR마다

`verification.md`의 PR 관문을 그대로 적용하되, 두 PR은 성능 가설이 아니라 결함 수정이므로 "겨냥한 행의 폭 밖 개선"은 요구하지 않고 **악화 없음**만 본다:

- 네 관문(`typecheck`·`lint`·다섯 프로젝트 `test`·`build`)과 verify 묶음 초록.
- 전후 배달 비교: B6은 이름이 `*`인 키를 쓰는 장면(위 11건)만, B7은 지움 배열 아래 keep 자손이 있는 장면만 차이가 나며 그 목록을 PR 본문에 이름으로 적는다. 그 밖의 차이는 0.
- 수정 전에 실패하는 새 시험.
- 한 창의 A/B(22행, 10프로세스, `--quality=legacy`)에서 TEST-073 주판정 0, `switch-oneOf-80`·`switch-siblings-0`의 단계 장부 총합이 A의 폭 안, Node 노드당 힙 B 중앙값 ≤ A 최대.
- 공개 겉면(`dist/index.d.ts`) 차분 0. 바뀐 fractal의 `DETAIL.md`가 코드보다 먼저. 격리 규칙의 정적 검사 시험이 B6에서 초록.
- 독립 검토(antigravity) 판정 파일 먼저, 스쿼시 병합. 기계 로컬 경로는 어디에도 적지 않는다(PROCESS-076).

## 검증 스케줄(460라운드, 소유자 지시)

검증은 단계로 나눈다. 수정을 반복하는 동안 워커는 표적 시험(바뀐 fractal의 시험과 계약 시험)과 typecheck·lint만 돌리고 푸시한다. 독립 검토는 첫 검토 뒤에는 지난 검토 이후의 delta만 다시 본다. 측정 창은 한 측정 담당이 준비된 후보들을 연달아 돌려 조용한 시간을 한 번만 만든다. 다섯 프로젝트 전체 시험·verify 묶음·전후 배달 비교·공개 선언 차분은 PR당 한 번, 검토를 통과한 최종 후보에서만, 한 worktree씩 순서대로 돌린다(두 worktree가 동시에 전체 시험을 돌리면 메모리 부족과 브라우저 연결 종료가 반복된다). B7은 B6 병합 뒤 rebase한 머리에서 그 한 번을 돌린다.

## 순서

B6과 B7은 서로 다른 worktree에서 병렬로 진행한다. B7은 `literalStar*` 파일을 건드리지 않고(B6이 지운다), B6 병합 뒤 단계 가지에 rebase해 PR을 올린다. 두 PR이 병합되면 B5 마감 측정과 460라운드 기록으로 설계 Ⅱ의 이정표를 찍는다.
