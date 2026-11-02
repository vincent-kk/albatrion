# 468라운드 닫기 — 측정 조건부 C1 이탈 기본값 읽기

2026-11-02. 상태 어휘 병합 머리55055f65b의 다음 작업입니다. 구현 관문과 별도 수용 측정을 구분하며 기존 원문·보충·실패 기록을 삭제하지 않습니다.

## 편집자 결정

- **468C-01 (한 번 쓰는 이탈 기본값의 경로 캐시 우회)**
  - 【추론】 소유자 원문65·79(`reviews/round-468-owner-answers.md:7-8`)에 따라 상태 어휘 병합 뒤의 A를 측정 조건부로 진행한다. C1의 이탈 기본값 포착은 공급된 load가 있으면 undefined를 포함한 load.value를 우선하고 이미 떼어진 노드는 기존 detachedReads의 defaultValue를 읽으며 나머지는 현재 loadSnapshot과 node.path로 getLoadValue를 호출해 경로를 직접 파싱한다. 이 한 번의 읽기는 runtime 포인터 세그먼트 캐시를 조회·삽입·퇴출하지 않고 살아 있는 defaultValue 게터는 준비된 문법과 기존 캐시를 유지한다. NODE-044의 포착 시점·얕은 참조·오류 배열 identity와 WRITE-085의 로드 스냅숏 출처는 같고 NODE-004·NODE-045의 노드·runtime 필드는 늘지 않는다. watch·오류·경고등·플래그·동결·WeakMap과 다섯 호출 지점 및 C2는 바꾸지 않는다. 구현은 특성화·삽입0 red/green·변이·전체 관문 뒤 별도 작업자가 N1000 아홉 셀을 12예열·60회로 재어 bulk 여섯 중 넷 이상에서 중앙값10%와1ms 이상 절감하고 모든 셀에서0.5ms 초과 퇴보가 없을 때만 수용한다. 미달이면 C1도 수치와 함께 기록으로 닫고 버전·릴리스·상위 PR은 소유자에게 남긴다.

## 근거와 남은 것

- 소유자 원문은 round-468-owner-answers.md, 현재 설계는 plan/lazy-capture/design.md, 실행 관문은 plan/lazy-capture/verification.md를 따릅니다.
- 최종 성능 수용·독립 검토·PR 게시·병합은 이 계약 기록과 구분합니다. 다음 라운드 번호는469입니다.

## Amendment 2 — 정적 문법의 보존

- **468C-02 (runtime 캐시 우회와 정적 문법 재사용의 분리)**
  - 【추론】 468C-01의 세 번째 우선순위는 Amendment 2로 좁힌다. 분기 있는 청사진의 이탈 기본값 포착은 getDependencyIndex(runtime.blueprint).pathSegments(node.path)에 runtime을 넘기지 않아 준비된 정적 문법을 재사용하고 미준비 경로만 보유 없이 파싱한다. 분기 없는 청사진은 getLoadValue(runtime.loadSnapshot, node.path)에 세그먼트를 넘기지 않는다. 두 경로 모두 runtime 포인터 세그먼트 캐시를 조회·삽입·퇴출하지 않으며 기존 oneOf 전환의 full-pointer decoder0 계약과 테스트는 그대로 유지한다. 공급된 undefined와 이미 떼어진 읽기의 우선순위 및 나머지 관측·필드·호출 지점은468C-01과 같다.

- 첫 전체 unit은4241통과·2실패·todo1이었다. 실패 두 건은 oneOf-80의 이전 payload 세 경로를 직접 파싱한 v1과 decoder0 계약의 충돌이며, 승인된 Amendment 2로 구현을 좁힌다. 기존 시험을 완화하지 않고 최초 실패 결과를 보존한다.

## 구현 관문 결과

- Amendment 2 제품은 `b0a8b3304`에 구현했습니다. 특성화14개·수정 설계 focused20개와 삽입0 red/green·M1–M3를 확인했고 기존 decoder0 시험은 그대로입니다.
- lint 경고0·타입·정식 빌드와 일곱 테스트 프로젝트·importModel은 실패0입니다. 실제 skip·todo 수와 원장/FCA 기준 비교 및 압축 원본은 verification/lazy-capture/results.md와 그 raw 자료에 보존합니다.
- 실제 제품의 성능 수용과 독립 검토는 다음 담당자에게 남깁니다. 구현 작업자는 측정·push·PR 게시·병합·버전 변경을 하지 않았습니다.
