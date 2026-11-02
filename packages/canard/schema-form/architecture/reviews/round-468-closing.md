# 468라운드 닫기 — 측정 조건부 C1 이탈 기본값 읽기

2026-11-02. 상태 어휘 병합 머리55055f65b의 다음 작업입니다. 구현 관문과 별도 수용 측정을 구분하며 기존 원문·보충·실패 기록을 삭제하지 않습니다.

## 편집자 결정

- **468C-01 (한 번 쓰는 이탈 기본값의 경로 캐시 우회)**
  - 【추론】 소유자 원문65·79(`reviews/round-468-owner-answers.md:7-8`)에 따라 상태 어휘 병합 뒤의 A를 측정 조건부로 진행한다. C1의 이탈 기본값 포착은 공급된 load가 있으면 undefined를 포함한 load.value를 우선하고 이미 떼어진 노드는 기존 detachedReads의 defaultValue를 읽으며 나머지는 현재 loadSnapshot과 node.path로 getLoadValue를 호출해 경로를 직접 파싱한다. 이 한 번의 읽기는 runtime 포인터 세그먼트 캐시를 조회·삽입·퇴출하지 않고 살아 있는 defaultValue 게터는 준비된 문법과 기존 캐시를 유지한다. NODE-044의 포착 시점·얕은 참조·오류 배열 identity와 WRITE-085의 로드 스냅숏 출처는 같고 NODE-004·NODE-045의 노드·runtime 필드는 늘지 않는다. watch·오류·경고등·플래그·동결·WeakMap과 다섯 호출 지점 및 C2는 바꾸지 않는다. 구현은 특성화·삽입0 red/green·변이·전체 관문 뒤 별도 작업자가 N1000 아홉 셀을 12예열·60회로 재어 bulk 여섯 중 넷 이상에서 중앙값10%와1ms 이상 절감하고 모든 셀에서0.5ms 초과 퇴보가 없을 때만 수용한다. 미달이면 C1도 수치와 함께 기록으로 닫고 버전·릴리스·상위 PR은 소유자에게 남긴다.

## 근거와 남은 것

- 소유자 원문은 round-468-owner-answers.md, 현재 설계는 plan/lazy-capture/design.md, 실행 관문은 plan/lazy-capture/verification.md를 따릅니다.
- 최종 성능 수용·독립 검토·PR 게시·병합은 이 계약 기록과 구분합니다. 다음 라운드 번호는469입니다.
