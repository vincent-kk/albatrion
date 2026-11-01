# DR-16·DR-17 Amendment 16 merge-gate 보완

capture의 최상위 실패 값 검사와 두 묶음 순회를 보강했습니다. 실패 값 읽기로 capture가 던지지 않으며, 안정된 정수 길이·own index·호출당 1,000,000개 점검 예산을 요구합니다. 읽을 수 없는 값·길이 변화·예산 초과는 unknown 또는 원래 identity의 불투명한 잎으로 남습니다.

기준 커밋은 이미 공개된 d68072d1ac7c2d01854bc22b82fecae8598a5db4이며 새 커밋만 추가했습니다. ledger·FCA 비교 기준은 61457653ae19dfb1f11b97e29355fa3cd6af8f24입니다.

## 동작과 기록

- capture는 code·details·details.errors·message·String(error)의 최상위 읽기를 한 검사 catch에서 보호하고, 읽기 실패 시 원래 error·origin·path·componentStack 및 고정 메시지 Unable to inspect captured failure의 RenderFailed 기록 하나를 보냅니다. 부분 details는 버립니다.
- predicate 안의 읽기 실패는 false/unknown입니다. 바깥 메타데이터를 읽을 수 있으면 기존 code·message·details를 유지합니다. onError 호출과 handler 예외 처리는 검사 catch 밖의 기존 통로를 유지합니다.
- 각 배열의 첫 길이를 고정 반복 범위로 쓰고 정수 1..2^32−1, 모든 own index, 마지막 길이의 동일성을 검사합니다. 호출 전체의 공유 원소 예산은 1,000,000개이며 host는 snapshot 전에 예약하고 실패해도 환불하지 않습니다.
- host는 실패한 현재 묶음을 같은 identity의 잎 하나로 보냅니다. 이미 방문한 바깥 형제와 순서를 유지하며, sink callback이 던지는 예외도 전파합니다. malformed·재방문·불투명 묶음이므로 최종 sink가 묶음을 받는 경우가 있습니다.
- handler routing은 capture·flush·reset·chain에서 [X,Y], validation handler에서 [X,Y,E], reporter 없는 validation 원본에서 [X,Y]를 exact identity로 검증합니다. malformed non-array slot bundle은 그 객체를 한 번 보냅니다.
- 기존 DR16C-01/DR17C-01의 82/85행과 인용은 보존하고 귀속 문구만 코디네이터 판정으로 정정했습니다. core/errors DETAIL의 삭제된 계약 기준 문장도 원문 그대로 복원했습니다. DR16C-02·DR17C-02 보충 다섯 개는 sup-insert로 추가했습니다.

## red·guard·mutation

최종 fixture로 d68072d1a에서 21개 회귀 실패와 12개 guard 통과를 확인했습니다. 최종 focused는 unit 79, render 30 + 3 skipped, React 18 33 통과입니다. 기존 12개와 신규 17개, 총 29개 mutation의 요구 assertion이 실패했고 10개 제품 파일 해시를 매번 정확히 복원했습니다.

두 validation sink mutation은 같은 파일 전체를 실행하여 각각 자기 사례 하나만 실패했습니다. predicate 보호 제거는 직접 predicate 테스트가 검출하고, capture 보호 제거는 최상위 네 사례가 검출합니다. unsafe recursive 변이는 deep 회귀와 prototype-only 직접 사례가 검출합니다. NaN은 최종 안정성 비교에도 거부되므로 좁은 length-validator 제거 변이는 negative/string-zero/fraction으로 검출합니다.

## 최종 전체 게이트

| Project | Passed | Failed | Skipped | Todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4191 | 0 | 0 | 1 |
| render | 1014 | 0 | 7 | 0 |
| react18 | 1012 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4235 | 0 | 0 | 1 |
| verify-render | 1014 | 0 | 7 | 0 |
| 합계 | 11741 | 0 | 23 | 2 |

lint 경고 0, typecheck, 정식 build와 DEVELOPMENT_FLAG_OK·GATE_SELECTION_DIST_OK 세 개, 별도 importModel 2건이 통과했습니다. 모든 실행은 순차이며 각 명령 전후 2,967개 source/config 입력의 실제 digest와 관측 시각을 기록했습니다. 전체 명령·프로젝트·원시 assertion 집계·현재 입력 해시를 G5가 직접 대조합니다. 공개 선언은 실제 현재/기준 산출물에서 comparator를 재실행해 97 exports·916 reachable signatures와 semantic 차이 0을 확인했습니다.

## 원시 증거와 검토

- 원장 26개 check는 exit 0입니다. 61457653a와 원시 로그를 비교하면 sup 인용만 3640 → 3650이며 기존 token missing 397과 plan/doc-coverage 진단은 같습니다. 이 보완에서 추가된 보충은 5개이고 앞선 보충 5개도 보존합니다.
- FCA structural findings 566 → 553, failed 26 → 21, diagnostics 306 → 293, verification violations 30 유지입니다. root prefix만 정규화한 원시 다중집합 비교에서 새 finding·diagnostic은 0입니다. 기존 indeterminate/violation 때문에 전체 FCA PASS를 주장하지 않습니다.
- 독립 검토는 제품 결함을 찾지 못했고 증거 도구 P2를 제기했습니다. G1/G3/G4/G6를 원시 파일·Git으로 재계산하도록 고쳤고 G5에는 실행 전후 source digest·정확한 명령·실제 선언 입력/재실행을 연결했습니다. 이 수정의 검증과 종결 기록은 주 작업자의 review-resolution이며 독립 검토자의 새 verdict로 제시하지 않습니다.
- raw FCA diagnostic·sup count 변조 대조 2개, source digest·명령 project·실행 시각·선언 입력 hash 변조 대조 4개가 실패하며 success marker를 내지 않았습니다. 원본을 정확히 복원한 뒤 양성 검사도 통과했습니다.
- 처음 전체 unit의 S1 실패는 새 RootNodeContext fixture가 형제 내부 helper를 import했기 때문입니다. 기존 FormErrorService 진입점 타입의 mock으로 고쳐 5개 대상 검사와 두 routing mutation을 재확인했습니다. 실패 원시 결과를 보존하고 전체 게이트를 다시 실행했습니다.

버전 0.16.0과 패키지 공개 표면은 그대로이며 tracked runtime bundle·adapter 출력은 source commit에 포함하지 않았습니다. 새 Git commit은 설정된 identity를 사용하고 author/email override·trailer·push는 하지 않습니다. artifact의 machine path prefix만 placeholder로 정규화했고 gzip mtime은 0입니다. manifest의 unpackPath와 hash는 보존한 원시 증거를 식별합니다.
