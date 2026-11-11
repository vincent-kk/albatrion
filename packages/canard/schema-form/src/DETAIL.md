# schema-form package contract

## Requirements

GOAL-001·003·004·005·006·013·014·025·032·049. 표준 스키마를 공유 계약으로 사용하고 폼은 편집·형상·표현을 더합니다. 판정은 검증기에 위임하여 서버와 화면이 서로 다른 검증 언어를 갖지 않게 합니다. 같은 개념에는 같은 이름과 한 장치를 사용하며, 값의 출처와 실패를 설명할 수 있어야 합니다.

GOAL-015·017·018·019·020·022·050·051. 일관성·투명성·예측가능성·표현자유도·고속성을 함께 판단합니다. 호환 계층이나 별도 검증기, 작성자의 잘못을 조용히 고치는 값 수리를 추가하지 않습니다. 표준 방언의 판정은 플러그인, 공개 형의 추론 한계는 [types](types/DETAIL.md), 입력 초안의 보존은 [fieldInputs](fieldInputs/DETAIL.md)가 소유합니다. 실제 동작 변경은 현재 계약으로 검증하며 과거 구현을 의미의 정답으로 삼지 않습니다.

### GOAL-024 — 충돌에서 유지하는 선택

동적 제어의 표현력을 유지하되 순환·배치와 순차의 차이를 숨기지 않습니다. 종료와 실패는 [정착](core/engine/settle/DETAIL.md), 배달은 [쓰기](core/engine/write/DETAIL.md)가 책임집니다. 최적화는 같은 관측을 내는 증거가 있을 때만 사용합니다. 이벤트는 소비자의 관측 통로이며 엔진 내부 상태 전이의 구동 장치로 되돌리지 않습니다.

GOAL-023·086. 검증 의미를 직접 구현해 속도를 얻지 않습니다. 생산 경로의 비용을 줄이기 위해 규칙의 모든 탈락을 공개 진단으로 만들지 않으며, 제어의 로컬 범위를 조상 잠금 상속으로 넓히지 않습니다. 대신 각 소유 문서에서 선택의 한계와 이유를 명시합니다. 일반 쓰기와 로드를 혼동하여 왕복 비동등성을 재채움으로 설명하지 않습니다.

### 예약 스키마 어휘의 단일 소유 / Reserved schema vocabulary

예약 키와 얕은 허용 형은 `constants/reservedSchemaKeys.ts`에서만 선언합니다. 엔진과 React 바인딩의 최저 공통 소유자가 이 패키지이므로 이 상위 organ을 직접 소비하고 core의 바인딩 표면을 넓히지 않습니다. 키 추가는 작성 계약 변경이므로 검증·경고·식 목록이 따로 드리프트하지 않도록 파생하며, 작성 타입 소유자가 양방향 키 일치를 검사합니다.

Reserved keys and accepted shallow shapes have one declaration in the ancestor constant. Engine and binding consumers derive their enumerations from it; adding a reserved key changes the authoring contract and must not drift between validation, warnings and expression selection. Type owners check key equality in both directions without moving authoring types or widening core.

파생 키 목록은 모듈 초기화 때 준비하고 존재·소속 검사에서 호출별 콜백이나 목록을 할당하지 않습니다. 키 정본을 복제하지 않으면서 선언 수와 쓰기 횟수에 비례하는 임시 할당을 막기 위한 비용 제약입니다. 열거의 타입 복원은 공통 typed-key 유틸과 국소 키 미러 생성에만 둡니다.

## API Contracts

LANDING-067·087·205. 패키지는 단일 공개 진입점에서 이름으로 계약을 조합합니다. [core](core/DETAIL.md)의 호스트 바인딩 통로는 내부 계약이며 제품 공개 이름을 자동으로 넓히지 않습니다. options·controls·presentation의 의미 변경도 공개 계약 변경입니다. 작성자가 스키마를, 호출자가 Form·명령을, 사용자가 입력을 제공한다는 구분으로 값 변경의 책임을 판단합니다(GOAL-085).

주소의 빈 이름·예약 이름 의미는 [jsonPointer](helpers/jsonPointer/DETAIL.md)가 소유합니다. Form 경로 매핑·노드 탐색·검증 라우팅이 각각 다른 주소 언어를 만들지 않습니다. 공개 값 채널과 노드 수명은 [surface](core/surface/DETAIL.md), Form의 읽기·제출은 [Form](components/Form/DETAIL.md)의 계약으로 연결합니다.

### TEST-007 — 관측 층마다 증거를 둡니다

코어 단위 검증은 실행 의미를, 렌더 시험은 DOM·입력 수명·콜백을 검증합니다. 코어 통과만으로 화면 동작을 입증하지 않습니다. 공유 시나리오는 [실행기 없는 데이터](../../../aileron/schema-form-scenarios/DETAIL.md)이고 코어 실행은 core, 화면 실행은 시나리오 패키지의 어댑터가 소유합니다(TEST-008·010·011·022·023). 스토리의 사용 예시 단언을 제품 동작의 유일한 근거로 삼지 않습니다.

TEST-001·006·012·013·085. 다른 검증 구현과의 차등 확인은 같은 구현에 대한 비교와 구별합니다. 현재 코어의 동일 AJV 비교는 독립 검증기 동치를 증명하지 않습니다. 입력 상황은 재사용하되 기대값은 현행 계약에서 정하며, 검증 매트릭스는 정적 표로 둡니다. 최적화 경로의 비공허성 하한은 의미상 필요한 작업을 단언하고, 일반 경로의 정확한 단언은 실제 fallback 입력으로 유지합니다. 내부 필드 조작이나 snapshot 재생성으로 잘못된 경로를 통과시키지 않습니다.

### REACT-017 — 지원하는 렌더 수명을 실제로 검증합니다

React 18·19에서 공유 렌더 시험을 실행합니다. 버전 전용 제외에는 이유를 두며 StrictMode·서버 렌더·하이드레이션·구독 재연결의 관측을 포함합니다. jsdom의 이벤트 모사가 실제 브라우저 IME 취소·캐럿·자동완성을 모두 증명하지는 않습니다. 입력 수명과 가상화의 한계는 [FieldInputBridge](components/FieldProxy/components/FieldInputBridge/DETAIL.md)와 [virtualization](helpers/virtualization/DETAIL.md)이 소유합니다.

TEST-021. 렌더 하니스의 추가 비동기 대기 생략은 미정착 엔진을 뜻하지 않습니다. reset의 동기 로드와 React 커밋 재대조를 구별하고 onError와 호스트 싱크를 각각 관찰합니다. nullable이 아닌 기본 글·수 입력의 clear는 DOM 비우기를 거쳐 undefined 전달을 확인하며 다른 위젯·배치 clear는 핸들 계약을 사용합니다.

### TEST-027 — 성능 판정의 규칙을 측정 전에 정합니다

TEST-026·028·029·031·032·033·071·072·073·081. 같은 입력·환경에서 기준판과 후보를 비교하고 준비 비용, 반복 쓰기, 루트 교체, 배치, 구독 경로와 보유 힙을 구별합니다. 워밍업 10회 이상·표본 100회 이상을 사용하고 중앙값·꼬리 지연과 처리량의 통계 판정을 혼동하지 않습니다. 기본 회귀 기준은 처리량 평균 15% 초과 하락과 Welch p<0.05이며 [통계 판정기](../../../aileron/benchmark-form/src/utils/stat-regression.ts)가 구현합니다. 절대 시간이나 별도 배율을 임의의 통과선으로 더하지 않습니다. 더 엄격한 가설별 기준은 측정 전에 고정하고 결과 뒤 완화하지 않습니다. 회귀는 이유와 비용을 기록하고 Vincent의 수용을 받아야 합니다.

TEST-074·075·076·086. 안전한 폼 크기나 모바일 한계는 같은 조건의 실측 없이 상향하지 않습니다. 번들은 ESM 진입을 의존성 외부화·minify·gzip -9의 같은 방법으로 비교하고 배포되는 비축소 결과도 구별합니다. 증가에는 이유와 수용이 필요하며 근거 없는 20KB 상한을 두지 않습니다. 컴파일 비용은 폼의 분석·생성과 검증기 몫을 분리하되 마운트 비용에 포함하고 별도 수치 예산을 만들지 않습니다. 노드·청사진 메모리를 더할 때는 같은 창에서 기준판과 Node·Bun 각 7개 표본의 후보 중앙값이 기준 최댓값 이하인지 확인합니다. 지연 생성·불필요한 고정 칸 부재를 지켜도 넘으면 숨기지 않고 수용 대상으로 남깁니다.

TEST-091. React 갱신 경과 시간은 동기 쓰기, 정착 완료까지의 전체 시간, 빈 장벽 비용과 이를 뺀 추정치를 구별합니다. 타이머 대기 바닥은 작업의 배치 위치에 따라 비용을 숨길 수 있으므로 Profiler 시간이나 처리량과 같은 수치로 해석하지 않습니다. 바닥 차감치는 음수를 허용하는 추정치이며 0으로 잘라 측정 잡음을 숨기지 않습니다.

TEST-084·088. 효과가 측정 폭보다 작으면 개선으로 채택하지 않습니다. 겨냥한 비용을 키운 탐침과 판정 행을 측정 전에 정해, 잡음에 묻힌 결과를 유리한 행 선택으로 바꾸지 않습니다. 결과가 폭 안이고 평소보다 폭이 넓으며 외부 작업과 겹친 증거가 있을 때만 Vincent의 허락으로 같은 규칙의 재측정을 한 번 허용합니다. 첫 결과도 함께 보존하여 반복 측정으로 유리한 창만 남기지 않습니다.

TEST-094·095. 기준·후보 프로세스를 행마다 교대로 실행하고 기준의 뒤 절반과도 대조하여 시간 흐름을 효과와 구별합니다. 창 품질은 개별 행의 ±5%가 아니라 변경하지 않은 대조 레인이 있는 모든 행의 후보 창/기준 창 최소값 중앙 비의 중앙값이 0.95–1.05인지로 판단합니다. 모든 행을 끝낸 뒤 판정하며 대조 레인이 없는 행은 N/A입니다. 창이 무효여도 힙·단계 검사는 끝내고 시간 결론만 판정 불가로 남겨, 행 자체의 잡음과 환경 이동을 제품 회귀로 오인하지 않습니다.

VALIDATE-028. 작은 기본 검증기와 플러그인을 함께 두면 같은 스키마에 서로 다른 답이 생기므로 기본 판정기를 내장하지 않습니다. AJV도 번들 비용과 플러그인 분리의 이점을 지키기 위해 내장하지 않습니다.

TEST-065. 검증기 구현의 속도를 폼이 보증하거나 특정 구현의 느림을 보상하는 별도 판정 장치를 넣지 않습니다. 각 기제의 비용·최악 조건은 소유 모듈에 남깁니다. FieldProxy의 display: contents는 소비자 레이아웃 비용을 격리하지 않으며 명시적 크기·CSS containment는 소비자 레이아웃의 선택입니다. 이를 일반 성능 보장이나 자동 CSS 정책으로 확대하지 않습니다.

## Acceptance Criteria

### notification-commit — 동기 필드 구독의 일괄 배달

한 핸들러에서 batch로 변경한 1,000개의 독립 구독 입력은 한 React 커밋에서 최종 값을 표시합니다. 이 크기는 여러 구독자로의 배달·커밋 병합을 검증하며 대형 폼 마운트 시간의 성능 보증은 아닙니다.

### migration-guide-identifiers — 소비자가 찾을 수 있는 이행 이름

이행 안내의 소비자 이름·오류 표시 표는 0.16.1 배포 선언의 이름을 출발점으로, 현재 공개 진입점에서 도달하는 이름을 도착점으로 사용합니다. 주석이나 구현 중간 이름은 선언의 증거가 아닙니다. 두 언어의 표는 같은 대응을 유지하며 Form·FormProvider의 이름이 바뀐 prop을 빠뜨리지 않습니다.

### conditional-static-load-render — 공개 관측 동등성

최초 구조 선택 최적화는 일반 마운트와 값·유효 스키마·표시 입력·오류·콜백 순서가 같으며 자격 밖 입력은 일반 경로를 사용합니다. 공개 표면 시험에서 관찰할 수 없는 내부 loader 호출 수로 이 계약을 대체하지 않습니다.

### conditional-static-load-lifetime — 수명 동등성

React 18·19의 StrictMode와 검증 바인딩 교체에서 중복 마운트·검증·리비전·콜백이 없고 콜백 읽기는 최종 스키마와 리비전을 봅니다. 공개 형·작성 표면·투영의 세부 수용 조건은 types·surface·Form의 계약을 따릅니다.

### agent-hybrid-example — 실행되는 부모 입력 예제

소비자 예제는 공개 FieldInputProps와 JSONSchema만으로 비단말 부모를 작성합니다. 부모의 함수 갱신자는 같은 배치에서 두 자식이 내보낸 값을 모두 보존하고, 재정의된 콜백은 자식 갱신자를 평가한 값을 받습니다. 그대로 커밋한 문자열 입력의 DOM과 포커스, 다음 형제 편집의 값 보존을 React 18·19에서 확인합니다.

## Boundary Exemptions

### `index.ts` — 공개 패키지 표면의 컴파일 전용 검증

- **Consumers**: `**/packages/canard/schema-form/src/__tests__/migration/switchSurface.type-test.ts`
- **Direct import**: `allowed`
- **Reason**: 이 검증은 패키지 공개 표면의 타입·가드·열거와 비공개 심볼의 부재를 확인하므로 패키지 진입점 자체를 소비해야 한다. 소유 경계의 검증 구획에 두고 패키지 tsc의 src 포함으로 검사한다. 이름을 유지한 컴파일 전용 .type-test.ts는 filid adapter의 검증 파일 분류와 Vitest 런타임 시험 glob에 포함되지 않으므로, 이 파일의 공개 진입점 참조에만 예외를 선언한다.

### `core/index.ts` — 로드 검증 슬롯의 바인딩 감싸기

- **Consumers**: `__tests__/e2e/validation.load-slot.render.test.tsx`, `__tests__/e2e/validation.load-slot-failures.render.test.tsx`
- **Direct import**: `allowed`
- **Reason**: 공개 API로 관찰할 수 없는 슬롯 시점·폐기·진입 횟수를 확인하기 위해 이 두 시험만 scheduleValidationSlot·startFieldNodeLoadValidation을 vi.mock으로 감쌉니다. 다른 e2e에는 확대하지 않습니다.

## Last Updated

패키지의 가치 선택·공개 조합 경계·검증 층·성능 판정 원칙이 바뀔 때 갱신합니다.
