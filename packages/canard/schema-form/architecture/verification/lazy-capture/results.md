# C1 이탈 기본값 구현 검증 기록

기준은 상태 어휘 병합 머리 `55055f65b52f952cd934eeec641314171e1ff253`입니다. 468라운드와 승인 설계의 계약 단계부터 기록하며, 구현 검증과 별도 수용 측정을 구분합니다.

## 계약 단계 기준

원장 항목1418, 보충 인용3714, 소유자 답773개가 기준입니다. 인용·보충 불일치와 ref 문제는0이며 문장17영역의 missing·bad classification도0입니다. doc-coverage의 기존 미인용66건과 plan-links의 기존 비현행 참조1건을 그대로 둡니다.

현재 명세의 캐시 설명 세 줄은 engine DETAIL의 포인터 세그먼트 캐시 행과 settle DETAIL의 settle-static-pointer-work 두 행입니다. 과거 B6 결과 문서의 캐시 경유 서술은 당시 검증 기록이므로 고치지 않습니다. 다른 INTENT·JSDoc·공개 문서·agent 문서에는 이탈 기본값이 준비 문법이나 캐시를 사용해야 한다는 현행 문장이 없습니다. 함수 JSDoc의 한 번 쓰는 읽기 설명은 구현과 함께 갱신합니다.

NODE-044는 이탈 읽기의 고정을, WRITE-085는 기본값의 로드 출처를 직접 규정하므로468C-01을 덧붙입니다. NODE-004의 고정 배치와 NODE-045의 runtime 소유권은 그대로여서 보충하지 않습니다. 새 필드·반환 배열·지연 관측은 추가하지 않습니다.

FCA 기준은 동일 snapshot의 scan·전체6범위 validate·verification으로 확보했습니다. 구조 finding566·실패26, verification 위반30과 기존 indeterminate 축을 유지하며 이를 절대 PASS로 바꾸지 않습니다. 구현 뒤에는 새 finding과 diagnostic을 다중집합으로 비교합니다.

특성화·기준 red·변이·전체 관문 및 수용 측정은 아직 이 계약 기록의 통과 주장에 포함하지 않습니다.

## v1 구현과 Amendment 2

특성화14개는 기준에서 모두 통과했고 삽입0 시험은 실제1500회 삽입으로 실패했습니다. v1의 focused22개는 통과했으나 첫 전체 unit은4241통과·2실패·todo1입니다. 기존 oneOf-80 diagnostics 두 경우가 이탈한 이전 payload 세 주소의 직접 파싱을 검출했습니다. 테스트를 바꾸지 않고468C-02로 준비된 정적 문법을 보존하도록 좁힙니다. 최초 실패 결과는 최종 raw 증거에 함께 보존하며 v1의 관문·변이 결과를 수정 설계의 통과로 재사용하지 않습니다.

## Amendment 2 구현 검증

제품 소스 커밋은 `b0a8b3304`입니다. 공급된 load의 undefined와 이미 떼어진 읽기를 우선하고, 분기 없는 읽기는 직접 파싱하며 분기 있는 읽기는 runtime 인수 없이 준비된 정적 문법을 재사용합니다. 살아 있는 게터·다섯 호출 지점·watch·오류·misfit·플래그·동결·WeakMap은 바꾸지 않았습니다. 바이트 범위 검증은 `raw/source-scope-audit-final.json.gz`에 있습니다.

기준 특성화14개는 통과했고 수정 설계의 focused20개도 통과했습니다. 삽입0 시험은 branchless의 실제300항목 대량 이탈과 nonbranchless의1500개 직접 포착을 분리합니다. nonbranchless의 전체 쓰기에는 별도의 살아 있는 presence 등록이 캐시를 사용하므로 포착 함수의 작업만 격리합니다. 두 시험 모두 기준에서1500회 삽입으로 실패하고 수정 뒤0회입니다. M1의 캐시 사용 복원은 두 시험, M2의 detached fallback 제거는 두 특성화, M3의 nullish 우선순위는 공급된 undefined를 포함한 세 특성화가 검출했습니다. 각 변이 뒤 승인 구현을 바이트 단위로 복원했습니다(`raw/red-final.json.gz`, `raw/mutation-final-m1.json.gz`, `raw/mutation-final-m2.json.gz`, `raw/mutation-final-m3.json.gz`).

lint는 경고0, typecheck와 정식 build도 통과했습니다. 정식 build의 개발 플래그·출하 gate 모드·타입 선언 검증이 함께 통과했으며 이 HEAD의 dist는 추적되지 않는 빌드 산출물이므로 소스 커밋에 포함하지 않았습니다. 별도 Vitest 프로세스를 동시에 실행하지 않았습니다.

| 프로젝트 | 통과 | 실패 | skip | todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4244 | 0 | 0 | 1 |
| render | 1018 | 0 | 7 | 0 |
| react18 | 1016 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4288 | 0 | 0 | 1 |
| verify-render | 1018 | 0 | 7 | 0 |
| import-model | 2 | 0 | 0 | 0 |

원본은 `raw/gate-summary.json.gz`와 각 프로젝트 JSON에 보존합니다. 기준의 기존 todo·skip을 포함한 실제 수를 그대로 기록했습니다. 최초 v1 unit 실패도 `raw/unit-v1-failed.json.gz`에 남깁니다. fresh worktree에서 발견한 AJV 버전·오래된 플러그인 선언·Storybook setup 링크 문제는 기존 설치와 로컬 빌드로 해결했고 제품·검사 설정은 바꾸지 않았습니다(`raw/environment-setup.json.gz`, `raw/storybook-setup-failed.json.gz`).

최종 원장 기준 비교와 FCA 세 관문의 원본·다중집합 비교는 `raw/ledger-base.json.gz`, `raw/ledger-final.json.gz`, `raw/fca-comparison.json.gz` 및 `raw/fca-{base,final}-{scan,validate,verification}.json.gz`에 고정합니다. FCA는 기존 확인된 위반과 indeterminate 축을 PASS로 바꾸지 않으며 새 finding·diagnostic을 모두 비교합니다. 모든 변경 파일은 압축을 풀어 기계 경로를 감사하고 모든22개 manifest의 버전도 기준과 비교합니다(`raw/machine-path-audit.json.gz`, `raw/version-audit.json.gz`).

## 성능 근거와 남은 수용 측정

이 구현 작업자는 성능 측정을 실행하지 않았습니다. 앞선 A3 scratch 제안은 bulk 중앙값0.920–1.534ms(9.82–24.21%) 절감과 여섯 셀 중 넷의 통과를 관측했으나, 이전 연구 HEAD의 직접 파싱 시제품 수치입니다(`raw/proposal-evidence.json.gz`). 준비된 정적 문법을 보존하는 Amendment 2 제품의 수용 결과로 옮기지 않습니다. 오류 getter가 이탈 도중 원본 조상을 바꾸는 경우에도 오류 읽기 뒤에 기본값을 읽는 순서와 얕은 참조를 유지하는지는 제품 특성화로 확인했습니다.

별도 작업자가 최종 제품 HEAD에서 N1000 아홉 셀·12예열·60회·독립 VM·동일 코드 control로 측정하고, bulk 여섯 중 넷 이상에서10%와1ms 이상 절감하며 모든 셀의 퇴보가0.5ms 이하인지 판정해야 합니다. 독립 검토·수용 판정·PR 게시·push·병합과 릴리스는 이번 구현 완료에 포함하지 않습니다.

## 전체 manifest 범위 확인

첫 버전 스냅숏의 root·packages22개 외에 documents/package.json도 기준 Git 트리에서 직접 읽어 포함했습니다. 최종 버전 감사는 전체23개 package.json을 비교하며 추가·삭제·버전 변경0, schema-form0.16.0 유지입니다. 경로 감사는 압축 원본을 풀어 모든 변경 파일에 적용하며 결과는 위 raw 감사 파일에 고정합니다.
