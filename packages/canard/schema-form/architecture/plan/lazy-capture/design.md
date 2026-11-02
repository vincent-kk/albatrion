# C1 현재 설계 — 이탈 포착의 직접 경로 해석

기준은55055f65b입니다. 468C-01에 따라 한 번 쓰는 이탈 기본값만 runtime의256개 포인터 세그먼트 캐시를 우회하며 현재 값의 읽기는 이탈 시점에 그대로 수행합니다.

1. 공급된 load가 있으면 load.value를 쓰며 undefined도 공급된 값입니다.
2. 이미 떼어진 노드는 runtime.detachedReads의 기존 defaultValue를 읽습니다.
3. 나머지는 getLoadValue(runtime.loadSnapshot, node.path)에 세그먼트를 넘기지 않습니다. 값 접근 순서와 얕은 반환 참조는 기존과 같습니다.

watch 블록·오류 읽기·misfit 필드·로컬 플래그·동결·WeakMap·다섯 호출 지점·살아 있는 게터와 C2는 그대로입니다. 노드나 runtime의 새 필드는 없습니다. NODE-004·NODE-045는 배치·소유권이 바뀌지 않아 보충하지 않고, 이탈 읽기를 고정하는 NODE-044와 로드 출처를 정하는 WRITE-085에468C-01을 덧붙입니다. VALUE-013·VALUE-044의 지연 읽기 선례는 이번 수정의 대상이 아닙니다.

## 수용 기준

실제 제품은 별도 작업자가 baseline·candidate·동일 코드 control을 각각 독립 Node VM에서 실행합니다. N1000의 plain/watch/errors와 setValue([])·clear()·remove(0)의 아홉 셀마다12예열·60회를 사용합니다. bulk 여섯 중 넷 이상이 중앙값10%와1ms 이상 절감하고 모든 셀의 중앙값 퇴보가0.5ms 이하일 때만 수용합니다. 사전등록 기준을 고치지 않습니다. 미달이면 C1을 수치와 함께 기록으로 닫습니다.

## Amendment 2 — 위 세 번째 우선순위보다 우선함

분기 있는 청사진은 getDependencyIndex(runtime.blueprint).pathSegments(node.path)에 runtime 인수를 주지 않고 그 세그먼트를 getLoadValue에 넘깁니다. 준비된 정적 문법은 그대로 쓰며 미준비 경로는 runtime 캐시에 넣지 않고 파싱합니다. 분기 없는 청사진은 세그먼트 인수 없이 직접 파싱합니다. 이 좁힘은 기존 oneOf-80의 decoder0 계약과 테스트를 유지하며 runtime 캐시 우회는 그대로 보장합니다(468C-02).
