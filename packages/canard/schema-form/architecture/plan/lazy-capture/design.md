# C1 실험 설계 기록 — 미채택 마감

판정은 CLOSE_C1_AS_RECORD입니다. 기준은55055f65b, 실제 측정 후보는0c95807f4이며 최종 가지는 기록과 기존 동작의 특성화만 남깁니다. 현행 제품 계약은 바뀌지 않습니다(468C-01·02).

## 시도한 v1과 Amendment 2

v1은 이탈 기본값 한 번의 읽기에서 공급된 load의 undefined와 이미 떼어진 defaultValue 우선순위를 보존한 채 getLoadValue에 세그먼트를 넘기지 않았습니다. 포착 시점과 전체 원본 순회, scalar 값과 object 얕은 참조, watch·오류·misfit·플래그·동결·WeakMap은 유지했습니다.

agy Flash 설계 검토는 PASS WITH CONDITIONS였습니다. P1은 현재 명세와 원장 보충을 구현보다 먼저 고치는 것, P2는 이미 떼어진 fallback을 명시적으로 유지하는 것이었습니다. 조건과 수용 관문은 verification/lazy-capture/raw/acceptance-design-and-gate.json.gz에 보존합니다.

첫 전체 unit에서 v1은 oneOf-80의 decoder0 계약을 깨뜨렸습니다. Amendment 2는 기존 시험을 그대로 두고 분기 있는 청사진에 getDependencyIndex(runtime.blueprint).pathSegments(node.path)를 runtime 인수 없이 사용해 준비된 정적 문법을 보존했습니다. 분기 없는 청사진만 직접 파싱했고 준비되지 않은 동적 주소도 runtime 캐시에 넣지 않았습니다. 이 후보는 기능·타입·빌드 관문을 통과했습니다.

## 측정 전에 고정한 규칙

N1000 plain/watch/errors × setValue([])·clear()·remove(0)의 아홉 셀과 oneOf-80 보호 셀 하나를 독립 Node VM의 baseline·candidate·동일 코드 control로12예열·60회 측정했습니다. guard는 여섯 전환 각각을 표본으로 삼았습니다.

control 중앙값과 baseline 중앙값 차이가 max(0.3ms, baseline의3%) 이하여야 유효합니다. 무효 그룹은 전체 세 프로세스를 한 번만 재시도하고 다시 무효면 void입니다. bulk 여섯 중 넷 이상에서 중앙값10% 및1ms 이상 절감하면서 절감이 control 차이의 두 배보다 커야 하며, remove와 guard를 포함한 모든 셀의 중앙값 퇴보가0.5ms를 넘으면 안 됩니다.

## 결과와 현재 상태

최종 열 셀은 유효하고0.5ms 초과 퇴보는 없지만 bulk 통과는 errors 두 셀뿐이어서 기준을 충족하지 못했습니다.1ms 하한이나 필요한 셀 수를 측정 뒤 바꾸지 않았습니다. 제품 함수·DETAIL·캐시 삽입0 시험을 되돌리고 기존 동작에서 통과하는 특성화14개를 유지합니다. 전체 원시 수치와 gate 결과는 verification/lazy-capture/results.md에 있습니다. 이 설계는 현행 구현 명세나 후속 구현 지시가 아닙니다.
