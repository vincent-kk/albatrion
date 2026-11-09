# engine contract

## Requirements

NODE-016·045. 의존은 청사진·레코드·순수 동작과 탐색·검증·파생·정착·쓰기 방향으로 흐릅니다. 검증 결과는 주입된 콜백으로 되돌리며 타입 import로도 역방향 결합을 만들지 않습니다. surface는 engine 진입점을 사용하고 자식은 형제의 진입점을 직접 사용합니다. 여러 자식이 공유하는 순수 보조는 이 경계에 두고 자식의 구현 형을 가져오지 않도록 필요한 칸만 구조적으로 받습니다.

경로 문법은 [jsonPointer](../../helpers/jsonPointer/DETAIL.md)의 정본을 사용합니다. 주소 해석과 현재 형상 조회를 섞으면 배열 이동·재진입 뒤 같은 주소가 다른 발생을 가리키는 사실을 잃습니다. 정적 작성 색인은 질의 miss로 늘리지 않으며 runtime 문법 메모는 트리 수명과 한도를 따릅니다. 생성기 스키마 코퍼스의 정본은 여러 자식이 소비하는 engine 시험 fixture에 둡니다.

## API Contracts

### SETTLE-043 — 값 변경의 공통 의미

VALUE-021. 원시는 SameValueZero로 비교하여 NaN끼리, -0과 0을 같은 값으로 봅니다. 배열은 길이·원소 순서, 평범한 객체는 prototype과 own 열거 키의 순서·값을 비교하고 다른 객체·함수는 참조로 봅니다. 같은 참조에는 내려가지 않습니다. 배달·감시·파생에서 서로 다른 같음 판정을 쓰면 같은 값을 새 변경으로 알리거나 에지를 반복 소비합니다. 호출자가 같은 객체를 제자리 변경한 사실과 순환 객체의 구조 동등성을 보장하지 않습니다.

깊은 비교의 지름길은 불변 입력의 공유를 전제로 합니다. 통째 교체한 컨테이너의 원소를 훑는 비용과 바뀌지 않은 원소 내부까지 내려가는 비용을 구별합니다. 참조 복원 시점·배달 후보는 [settle](settle/DETAIL.md), 에지 기준은 [derive](derive/DETAIL.md)가 소유합니다. 값 의미를 포기해 성능 선을 맞추지 않습니다(TEST-071).

### engine-derived-lifetimes — 파생 레코드와 생성 사실

청사진·호스트의 파생 슬롯은 각 소유자가 독립적으로 지연 준비합니다. 읽기만으로 모든 슬롯을 채우지 않고 미준비·null·false 결과를 구별하여 부적격 분석을 반복하지 않습니다. 불변 분석만 공유하고 살아 있는 값·노드·판정을 이 수명에 저장하지 않습니다. 생성 때 확정한 사실은 폐기 가능한 파생 저장소에 넣지 않아 모드 변경 뒤 청사진의 의미가 사라지지 않게 합니다(SURFACE-065).

모드의 실제 변경은 두 파생 저장소를 교체하므로 트리 생성 전에만 지정하고 시험·벤치는 finally에서 복원합니다. 상수·단조 ID는 캐시 초기화 대상이 아닙니다. 노드·트리 메모의 보유·reset·폐기는 [record](record/DETAIL.md), 소비자 요청 캐시는 [app/cache](../../app/cache/DETAIL.md)의 다른 수명입니다. 내부 모드와 초기화 통로를 패키지에 공개하지 않습니다.

### fragment-owner-paths — 조각 소유권의 공통 언어

CONTROLS-077. 조각이 직접 선언한 properties·prefixItems·items·additionalItems 경로를 하나의 공통 판정으로 읽습니다. 이름의 단순 접두 일치로 itemsList 같은 다른 이름을 소유 자식으로 오인하지 않습니다. 배열의 템플릿과 구체 위치 모두 같은 소유 의미를 사용하여 청사진의 색인·정착의 제어 층·파생의 대상이 갈라지지 않게 합니다. 실제 규칙 실행은 각 자식의 계약입니다.

### schema-options — 열린 작성 옵션의 형

AuthoredSchema의 options는 알려진 옵션 형에 소비자 Options 제네릭과 열린 any 인덱스를 교차합니다. 알려진 키를 any로 넓히지 않아 자동완성과 오타 방어를 유지하며 controls의 닫힌 형은 바꾸지 않습니다. 런타임 수용·검사 정책은 [buildNodes](blueprint/buildNodes/DETAIL.md)에 둡니다.

### validated-control-reads — 검증된 선언의 읽기

공유 제어 읽기는 collectDeclarations가 validateControlGroups를 마친 선언 및 그 선언에서 만든 유효 스키마만 받습니다. 얕은 형 보증과 예외는 [buildNodes의 읽기 계약](blueprint/buildNodes/DETAIL.md#reserved-read-trust--로드-검증을-통과한-읽기--validated-reads)을 따릅니다. Read helpers trust validated declarations and their effective projections; they do not widen this guarantee to pre-validation or arbitrary external schemas. The typed view adds no copy or retained state.

### engine-shared-storage — 공동 보조의 비용과 경계

경로 키 저장소는 native Map·Set 의미를 유지하며 항목 수 K와 깊이 D에 따른 O(KD) 접두 참조·색인 비용으로 국소 조회를 지원합니다. 인스턴스 adoption이나 메서드 패치를 하지 않습니다. 기능 부재가 정적으로 증명된 경우만 공유 읽기 전용 빈 Map·Set을 사용합니다. 공유 동결 빈 배열은 identity sentinel을 제외하고 공용 EMPTY_ARRAY를 사용하여 변화 없는 읽기에 할당을 더하지 않습니다.

객체 합성과 extras 복사가 공유하는 안전한 키 쓰기는 이 경계에 두고 __proto__를 own property로 보존합니다. union fold를 포함하는 종류 정체성도 공통 보조로 계산하여 자식별 충돌 판정이 달라지지 않게 합니다. 별도 노드 고정 칸이나 영구 토큰 캐시를 더하지 않습니다.

### 포인터 문법의 제한된 호출 계측

- 다음 여덟 시험은 `helpers/jsonPointer`의 내부 모듈 하나를 `vi.mock`으로 감싸 호출 수를 센다. 호출 수는 jsonPointer index로 나가지 않는 내부 함수의 일이고, 감싸기는 import 간선을 만들지 않으므로 파일마다 하나의 내부 모듈만 선언한다. 패턴이 아니라 파일 목록이며, 여기에 없는 시험은 같은 방식으로 내부를 감쌀 수 없다.
  - `utils/paths/__tests__/pointerSyntaxCache.test.ts`: 런타임 문법 캐시의 적중이 `utils/parsePointerSegments`를 다시 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-path-work.test.ts`: mount 뒤 첫 실제 쓰기가 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-slot-work.test.ts`: 슬롯 경로 작업이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-watch-work.test.ts`: watch 해석과 전달이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/utils/dependencies/__tests__/getDependencyIndex.live-paths.test.ts`: 살아 있는 배열 경로의 확장이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/utils/dependencies/__tests__/getDependencyIndex.pointer-work.test.ts`: 의존 색인의 조회와 캐시 재충전이 부르는 `utils/parsePointerSegments` 횟수를 센다.
  - `blueprint/__tests__/blueprint.owned-inline-path-work.test.ts`: 자식 생산자의 이름 이스케이프 횟수를 `utils/formatSegment` 감싸기로 센다.
  - `settle/utils/gates/__tests__/getGateBudgetCap.pointer-work.test.ts`: 같은 gate의 예산 분류가 `utils/parsePointerSegments`를 한 번만 부르고 준비된 예산을 재사용함을 센다.

## Acceptance Criteria

### fixed-first-load-validation — 구조 선택과 검증 시점을 구별합니다

구조를 고르는 guard는 필요한 자리에서 동기로 실행하고 전체 검증 컴파일은 요청 경계를 따릅니다. 최초 검증이 원래 작성 루트를 사용하며 오류·검증 파동은 일반 마운트와 같습니다. 실행·예약 상세는 [validation](validation/DETAIL.md)과 [validationScheduling](validationScheduling/DETAIL.md)이 소유합니다.

### literal-star-controls — 예약 이름의 정확한 대상

별표 이름과 wildcard를 혼동하지 않고 fields·주입·watch가 같은 이름을 같은 속성으로 해석합니다. 문법 판정의 정본을 실행 계층별로 복제하지 않습니다.

### branchless-observables — 최적화의 관측 동등성

같은 스키마의 일반 분석과 빠른 분석은 최초와 후속 쓰기의 트리·값·오류·경고·진단·리비전·배달이 같습니다. 기능 부재를 증명하지 못한 입력은 일반 경로를 사용합니다.

### engine-entry — 조합 경계는 구현을 복제하지 않습니다

필요한 이름만 명명 재수출하며 내부 helpers와 시험·벤치 모드가 패키지 표면으로 새지 않습니다. 내부 모드의 검증은 실제 존재하는 선택·술어·바퀴·파생 경로를 대상으로 하며 슬롯 보존을 끄는 별도 원본 모델을 가정하지 않습니다.

## Boundary Exemptions

### `blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts` — 같은 입력의 일반 분석 대조

- **Consumers**: `__tests__/blueprint.branchless-differential.test.ts`
- **Direct import**: `allowed`
- **Reason**: 같은 스키마의 일반 분석을 강제하는 capability 감싸기는 공개 입력으로 표현할 수 없으므로 이 통합 시험만 vi.mock으로 자식 내부를 감쌉니다. 공개 수출을 넓히거나 다른 시험으로 예외를 확대하지 않습니다.

## Last Updated

공통 값 동등성·파생 수명·의존 경계·공유 보조의 비용이나 통합 검증 경계가 바뀔 때 갱신합니다.
