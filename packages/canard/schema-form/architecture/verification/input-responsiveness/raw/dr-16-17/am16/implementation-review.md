# Amendment 16 독립 구현 검토

검토 기준은 `d68072d1ac7c2d01854bc22b82fecae8598a5db4`부터 현재 작업 트리까지이며, 미추적 테스트 6개를 포함했습니다. 제품 코드의 수정이 필요한 결함은 발견하지 못했습니다. 외부 검증 도구에는 승인된 계획과 다른 P2 발견 사항 1개가 남아 있으므로, 이 보고서는 최종 병합 게이트 통과 판정이 아닙니다.

## 발견 사항

### P2 — 최종 게이트가 원시 증거 검증 대신 자체 선언 요약을 신뢰합니다

- 위치: `am16/check.py:44`의 G4, `:53`의 G5, `:65`의 G6입니다. 검토한 파일 SHA-256은 `c0e006f410df229ab3e93fd7c03654e6631785a35caf3df4a6b8f46f5862b264`입니다.
- `plan.md`의 승인된 R1은 G4가 실제 정본·원장·원시 FCA finding/diagnostic 다중집합을 읽고, G5가 명령의 시작·종료·exit·소스 해시를 확인하며, G6가 경로/gzip/버전 조건을 Git과 파일에서 재계산하도록 요구합니다. 자체 선언 요약만으로 충분하지 않다는 조건도 명시되어 있습니다.
- 현재 G4는 `records.json`의 `attributionOnlyPhraseChanged`, `restoredContractReferencesVerbatim` 등의 불리언과 `fca-comparison.json`의 빈 차이 목록을 그대로 신뢰합니다. G5는 11개의 exit 0과 보고서 success를 확인하지만 실행 순서·겹침·소스 해시를 검증하지 않습니다. G6는 `versionUnchanged`와 `addedMachinePathHits`를 그대로 믿고 실제 manifest/diff/gzip을 읽지 않으며, 추적 runtime 산출물 검사도 없습니다.
- 따라서 이후 정본이나 패키지 버전이 바뀌거나 다른 소스로 실행한 과거 게이트 결과가 재사용되어도 요약 필드만 유지되면 EXPECT 마커가 나올 수 있습니다. 이번 검토에서는 별도로 정본·인용·제품 해시를 대조하여 그 부분의 현재 상태는 확인했지만, 승인된 자동 관문 자체의 누락은 남아 있습니다.
- 필요한 조치: 주 작업자가 최종 증거를 갱신할 때 해당 검사를 실제 파일·Git·원시 로그로 재계산하도록 보강하고, 갱신된 G4–G6 결과를 남겨 주셔야 합니다. G1–G3도 기록된 command exit와 현재/정의/복구 해시의 결합을 검사하지 않으므로 승인된 R1 전체를 함께 점검하시는 편이 적절합니다. 이 도구 보강만으로 제품 테스트를 다시 실행해야 한다는 뜻은 아닙니다.
- 코디네이터에게 `msg_5059309a1a40`으로 전달했습니다. 검토 시점에는 `records.json`, `gate-executions.json`, `handoff.json`, `fca-comparison.json`, `public-declarations.json`이 아직 없었으며, 전체 게이트 갱신이 진행 중인 점은 별도의 제한으로 취급했습니다.

## 제품 구현 확인 결과

- `createFormErrorService.capture`는 최상위 code/details/message, details.errors 인자 평가, 문자열 변환과 레코드 생성을 입력 검사 try/catch 안에 둡니다. 실패하면 RenderFailed, 고정 메시지, 원래 error identity 및 origin/path/componentStack을 보존하고 부분 details를 버립니다. onError 실행은 별도 try/catch이므로 handler bundle은 기존 host 통로로 전달되며, host sink 예외가 입력 검사 실패로 오인되지 않습니다.
- 중첩 predicate 자체가 읽기 실패로 false를 반환하면 바깥 레코드는 미리 읽은 code/details와 정상 message를 사용합니다. 따라서 읽을 수 있는 바깥 메타데이터를 고정 fallback으로 바꾸지 않습니다. render componentStack이 있으면 code를 RenderFailed로 두는 기존 규칙도 유지합니다.
- 두 순회 모두 첫 length를 지역 변수로 고정하고 정수 1..2^32−1만 허용합니다. 모든 원소의 own 여부를 읽기 전에 검사하며, 완성 후보는 마지막 length 읽기와 비교합니다. 원본 배열의 length를 루프 조건에서 다시 읽지 않습니다.
- predicate의 remaining과 host의 budget은 호출마다 하나이며 모든 중첩에 공유됩니다. host reader는 원소를 읽기 전에 길이를 예약하고 snapshot 실패 시 환불하지 않습니다. root 4 + bad 600,000 예약 후 good 400,000을 거부하여 good index 0을 읽지 않는 `[A,bad,good,H]` 회귀가 이 조건을 구분합니다.
- host는 후보 전체의 snapshot이 성공한 후에만 잎을 방문합니다. 실패한 현재 묶음은 같은 identity의 잎 하나로 전달하며, 이미 방문한 바깥 형제는 유지합니다. frame stack·root visited seed가 깊이 우선 순서, cycle·재방문 불투명 처리 및 깊이 50,000의 비재귀 동작을 유지합니다. visit 실행은 reader catch 바깥입니다.
- 신규 라우팅 테스트는 capture, flush, reset, deliverChainRecords의 handler `[X,Y]`, validation handler `[X,Y,E]`, reporter 없는 validation original `[X,Y]`, malformed slot 1회를 각각 정확한 호출 수와 identity/순서로 단언합니다. 전역 mock과 console spy 복구도 확인했습니다. 테스트별 case 수는 3~9개로 한도를 넘지 않습니다.

## 기록 및 증거 대조

- 외부 brief의 Amendment 16, plan/gates/criteria/red/green/mutations/source-snapshot, 저장소 AGENTS.md·root/package CLAUDE.md·패키지 AGENTS.md·적용 규칙 및 소유 INTENT를 읽었습니다. 테스트·빌드·설치·fetch·commit·게이트 실행은 하지 않았으며, 이 외부 보고서 외에는 파일을 수정하지 않았습니다.
- red 원시 JSON은 신규 33개 중 21 failed/12 passed이며 모든 criteria의 파일·제목·상태가 정확히 하나씩 대응합니다. red-provenance의 criteria 해시와 기준 커밋의 제품 소스 해시도 일치합니다.
- green 원시 JSON은 unit 79 passed, render 30 passed/3 pending, react18 33 passed입니다. 신규 33개와 legacy 112개 criteria가 모두 기대 상태와 대응합니다. render의 3개 pending은 기존 criteria에 지정된 React 18 legacy-root 사례입니다.
- 29개 mutation definition의 변경 후 bytes 해시는 기록된 changedHashes와 일치합니다. 모든 필수 제목이 원시 assertion에서 실패했으며 메시지는 호출 수·identity·순서·예외·read fuse 등 해당 의미를 가리킵니다. 수집 실패나 누락 import에 기대는 실패는 발견하지 못했습니다.
- 두 validation raw-sink 변이는 같은 파일 전체를 실행하여 각각 자기 사례 하나만 실패했습니다. predicate guard 제거는 입력 catch만 제거하며 직접 predicate 4개가 검출합니다. unsafe recursive 변이는 prototype-only 직접 사례와 deep 회귀가 검출합니다. length-validator 제거는 negative/string-zero/fraction이 검출하며, NaN은 남은 최종 비교에서 `NaN !== NaN`으로 거부되는 좁은 범위를 유지합니다. fixed-bound와 final-stability 제거 변이도 서로 분리되어 있습니다.
- 29개 변이 각각의 beforeHashes/restoredHashes가 10개 제품 소스 전체에서 동일하고 source-snapshot의 해시와 일치합니다. snapshot의 text 자체와 현재 제품 파일도 동일한 SHA-256입니다.
- `src/core/DETAIL.md`와 `src/errors/DETAIL.md`의 계약 기준 문장은 `61457653ae19dfb1f11b97e29355fa3cd6af8f24`과 정확히 같고, `2026-11-02`와 빈 줄 다음에 있습니다.
- 정본 review는 기준 내용에서 귀속 문구만 바꾼 뒤 Amendment 16을 덧붙인 형태입니다. 기존 결정 82/85행은 원문과 위치가 모두 그대로입니다. DR16C-02는 93행, DR17C-02는 96행이며 원장 보충 5개의 인용문이 해당 정본 행과 정확히 같습니다. sup-plan도 ERROR-028의 DR16C-02와 ERROR-008/019/028·EVENT-046의 DR17C-02를 지정합니다. sup-insert 실제 실행 exit는 이번 보고서만으로 입증하지 않습니다.
- README·사양·quick reference·agent knowledge·DETAIL의 변경은 안정 길이/공유 예산/불투명 묶음의 host 전달을 명시합니다. 기존 결정과 과거 인용은 보존되어 있습니다.

## 제한 및 인계

전체 lint/typecheck/build/artifact/7개 Vitest project/importModel, 26개 최종 원장 검사, 새 FCA 비교, 공개 선언, 최종 commit/clean tree/PR pin은 주 작업자의 갱신 대상이며 이 검토에서 재실행하거나 최종 통과를 선언하지 않았습니다. 현재 제품 코드에 대한 발견 사항은 없지만, 위 P2 검증 도구 수정과 최종 원시 증거 확인이 남아 있습니다. 기존 unreadable capture 테스트는 error/code 중심 단언이므로 바깥 message/details 보존은 소스 추적으로 확인했으며 별도 실행 재현을 추가하지 않았습니다.

검토 증거 SHA-256:

- criteria.json: `82dbb4ec6a556ca4db5a0b1b64be15db088231a994041cce908dedb37477add2`
- red.json: `b370b4e7c08260da35a255749e737d8e9c2f89492594e04b9f3654d03192a0ee`
- green.json: `ca3869dd4af38d356cf780a8391a941e37d20743d4e61b7ae4dd1f40da4d5595`
- mutations.json: `34a11fe7b703f6557132978e189cfa31a9f7fa29f85ef5d8d60bd4d9cc68ac69`
- source-snapshot.json: `3e88fd981cddc10f4c5ba7c16cf97d11cc581f545e100b1f96609ceb2b5efdaa`
