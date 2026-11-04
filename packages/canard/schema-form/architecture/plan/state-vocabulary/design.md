# 상태 어휘 단계 최종 설계

## 범위

#508 뒤 승인된 별도 단계이며 VALUE-044·NODE-067이 현재 계약입니다. v1 및 Amendment 1–3의 최종 결론을 통합합니다. [소유자 원문](request.md)의 78번이 앞선 이름을 대체합니다. 공개 enum·노드 getter·record의 이름을 함께 바꾸며 호환 별칭은 두지 않습니다.

## 이름과 상호작용

`FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꿉니다. isRoot는 유지합니다. 내부 readFieldNodeMisfit도 readFieldNodeIsMisfit으로 바꾸고 관측 노드 키·입력 상호작용 플래그도 새 이름을 씁니다. FieldInput/FieldRenderer props·FieldInputHint·schema·controls 키는 그대로이며 연결되는 노드 indexed type만 새 이름을 씁니다. DirtyPathSet·dirtyPaths 등 정착 재계산 어휘는 유지합니다.

`isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError.Edited는 사용자 입력 편집 이후 오류를 보이고 EditedTouched는 touched까지 충족할 때 보입니다. 기본 정책·비트 값은 유지하고 새 조건은 추가하지 않습니다. 두 상태 getter는 UpdateState에서 다시 읽습니다.

## 기준 출력과 지연 읽기

`isDivergent`는 현재 폼 출력과 마지막 루트 로드 커밋 출력의 같은 경로 값을 비교한다. 기준은 `loadBaseline` 박스의 최종 루트 출력 참조이고, 첫 로드 전과 detach 뒤에는 false다. 루트 reset·루트 resetSubtree·rebuild·validator 교체는 새 기준을 만들며 자식 reset과 일반 쓰기는 옮기지 않는다. 배열은 위치로 비교하고 hole·숨김 값도 폼 출력 그대로 포함한다. 자식 reset의 원본은 아이템 identity를 따라가므로 배열 재배치나 외부 파생값에 따라 reset 뒤에도 true일 수 있다. `sameValue`는 각 단계의 같은 참조를 건너뛰며 미선언 객체 키 순서에 민감하다. 읽기는 두 경로를 O(depth)로 걷고 현재 값과 기준 값을 `Object.is`로 키 삼아 결과를 메모한다. 쓰기에는 기준 읽기나 비교를 더하지 않고 반복 읽기의 비교 호출은 0이다. 메모는 자기 경로 값만 보유하며 기준은 로드 뒤 교체된 부분을 보유한다. 정착 중 읽기는 `value`·`outputValue`처럼 일시 값을 줄 수 있으나 모든 입력을 키로 삼으므로 커밋 뒤까지 남지 않는다. React 소비자는 루트의 `UpdateValue`·`UpdateState`·`RequestRefresh`와 해당 노드의 `UpdatePath`에서 다시 읽는다. 루트 로드의 C와 S 경로는 모두 `RequestRefresh`를 전달하므로 같은 출력 reset도 포착하며 루트나 노드 교체 때 구독을 다시 연결한다. 커밋 전 던진 로드는 기준을 유지하고 커밋 뒤 보고되는 예산·식·게이트 실패는 degraded 출력을 새 기준으로 삼는다.

정적 첫 로드의 loadStaticFirstTree 끝과 정착 commitSettlement의 loadScope===root에서만 최종 emit을 박스에 넣습니다. undefined 출력과 미설정 기준을 구별합니다. 배열 아이템의 자체 emit이 아니라 양쪽 모두 getLoadValue와 같은 cached path segments를 사용합니다. cache 필드는 생성자에서 current/base undefined, result false로 초기화합니다. NaN 반복 읽기도 Object.is 키로 적중하며 -0 차이는 재계산만 유발합니다. isDivergent는 readonly getter입니다.

## 투명 메모와 VALUE-013

읽기 시점의 순수 결과를 그 입력 전부(현재 출력과 기준값의 같은 경로 값)를 키로 메모합니다. 정산 중 읽기는 value·outputValue처럼 일시 값을 줄 수 있으나 키가 달라지므로 커밋 뒤까지 남지 않습니다. 외부 관측값 불변과 정착 완료 상태에 대한 보장은 유지합니다. inactiveValues lazy memo·watchValuesMemo·combinedErrors·pointer segment LRU·WeakMap 파생 record가 선례입니다. 일반 value의 읽기 재조립은 도입하지 않습니다.

## 검증과 기록

기존 guard와 새 getter 부재 red를 나누고 실제 사용자 입력·프로그램 쓰기·reset·detach·배열 재키·hole·hidden·key 순서·load 실패·React 갱신을 고정합니다. 정적 첫 로드는 default d와 undefined 입력 및 모듈 spy로 실제 빠른 경로를 확인합니다. 비용 spy는 divergence-reader 모듈 자체와 sameValue를 대상으로 하며 쓰기 뒤에 설치합니다. flat 2000은 비교 1회, nested 200×10 edit/restore는 false·비교 1회·기준 Reflect.get≤210, 같은 입력 반복은 비교 0회입니다. 6개 변이가 해당 시험을 실패시켜야 합니다.

41개 gate-table 파일은 노드 키만 바뀌며 일회성 tools의 역변환·해시로 증명합니다. capture hook·update mode 변경은 제품 도구에 남기지 않습니다. X1은 저장소 텍스트 전체(legacy·architecture 기록·날짜 보고·dist·의존성 제외)를 검색해 rename·keep-recompute·keep-schema-controls-props로 모든 hit를 기록합니다. 기준 파일 목록도 기준 git tree를 사용합니다. 원장 보충은 현행 항목에만 sup-insert로 넣고 새 항목의 설계 인용은 매 문장에 ID와 모든 코드 토큰을 포함합니다.

## 성능 창 사전 계약

코디네이터의 별도 측정은 B/F 두 lane과 BF/FB Williams 순서, 예열 3·보존 10페이지 및 keys===200 무결성을 사용합니다. 하네스 unit·smoke와 독립 사전등록 확인 뒤 창을 시작합니다. stage state-vocabulary·version state-vocabulary-v1의 새 규칙 파일과 inputs.json의 독립 SHA를 쓰며 기존 closing 규칙·helper를 바꾸지 않습니다. SV-1은 B 기준 closing-v3-amendment-6을 적용하고 C7은 제외합니다. ratio-only 판정은 F/B 95% bootstrap 상한>1.10과 F−B 중앙차 상한>사전등록 floor를 모두 넘을 때 막습니다. callDuration과 C1 processing floor는 1ms입니다. SV-2 validator work는 F=B입니다. divergence 행은 F 절대 시간만 보고하며 횟수는 unit test가 고정합니다. heap은 100회 편집 뒤 CDP collectGarbage와 Runtime.getHeapUsage로 B/F를 비교하고 heap snapshot은 커밋하지 않습니다. 성능 창과 독립 최종 검토·릴리스 결정은 구현 관문 뒤 코디네이터가 마감합니다.

## 최종 관문 보강

각 노드는 생성자에서 초기화한 `divergencePath`와 `divergenceSegments`에 마지막 주소와 segment 배열을 보유하고 `Object.is`로 주소가 같으면 전역 LRU와 dependency index를 재조회하지 않는다. 320개 노드의 두 번째 sweep에서 parse 호출은0이며 추가 보유 비용은 노드별 경로 깊이에 비례한다. 엔진 내부 spy는 엔진 fractal의 시험에 위치하고 import-model 예외를 두지 않습니다. 두 API reference의 bare 노드 선언과 indexed access도 현재 이름으로 통일합니다.
