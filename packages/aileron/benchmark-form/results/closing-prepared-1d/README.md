# 단계 마감 측정 — Phase 1d 준비

Amendment 7의 코드·테스트 보강을 미커밋 상태로 준비했습니다. HEAD는 ce1066b335bd6d66b95c308962dda7156ba7ea48입니다. 등록 버전 closing-v3-amendment-6과 규칙 SHA-256 `cc538cb41fb123be4ebf9ea67d1384bf40b068096cf9596a9c6db350b8687430`을 유지합니다. 제품 소스·패키지 버전·lockfile 변경은 없습니다.

예외 delta 비교를 절대 차이 ≤1e-9로 바꾸고, checkStageClosingResults.ts를 decision 및 committed diff 범위에 넣었습니다. deriveValidationAfterPaintResults.ts·IR-6 fixture·checker의 committed drift 테스트는 현재 해시와 timed blob을 맞춰 두어 diff 범위가 빠지면 실패합니다. uncommitted drift 테스트는 formal-start hash 검사가 빠지면 실패합니다.

10개 페이지·100회 연산의 validate 평균 1→1.1에 delta:0.1 예외를 주면 PASS이고 없으면 FIX_REQUIRED입니다. F의 추가 compile 한 건은 정확히 compileMean 위반이며 빈 designCause는 예외로 인정하지 않습니다. 빌드 기록의 exitCode, commit, cleanProductScope 부정 사례도 검증합니다.

C5 비율 상한 1.2에서 차이 12ms·16.7ms는 PASS, 16.71ms는 FAIL입니다. 54ms 프레임의 페이지별 연산 수 B=[4,4,4,4,4,4,4,6,6,6], F=[6,4,4,4,4,4,4,4,6,6]인 paired 예제는 unfloored 상한 +Infinity·차이 27ms로 FAIL, floored 상한 1.04·차이 2ms로 PASS입니다. 동일 배열을 비교하던 기존 테스트를 이 예제로 교체했습니다. 15-case 제한 때문에 경계 3개는 별도 decideStageClosingOperationFrame.test.ts에 둡니다.

수정 전 delta 비교와 checker 범위 테스트에서 예상한 3개 assertion 실패를 확인했습니다. 수정 후 28개 관련 테스트가 통과했습니다. 이어 10개 변이 실행에서 대응하는 15개 assertion 실패를 확인했고 각 실행 직후 후보를 복원했습니다. 초기 delta 실패까지 포함하여 모든 신규·교체 테스트가 지정 결함을 검출했습니다. mutation-evidence.json에 정확한 변이 문자열, 대상 테스트, 실패와 복원 여부를 기록했습니다.

복원 후 전체 패키지 20개 파일·131개 테스트, 브라우저 타입 검사, 경고 0 lint가 통과했습니다. ce1066b33 기준 경로 감사에서 신규 machine path 0개이며 git diff --check도 통과했습니다. 원본 IR-6 저장 raw 재현도 전체 테스트에 포함됩니다. candidate-sha256.json은 이 준비 상태의 코드·테스트·사전등록을 식별하며 정식 창의 toolHashes를 대체하지 않습니다.

독립 검토 범위는 Amendment 7과 candidate-sha256.json의 후보 파일입니다. 변이는 각 JSON 항목의 source에서 replacements를 적용하고 해당 test/pattern을 workspace vitest로 실행한 뒤 후보를 복원하여 재현할 수 있습니다. 기존 Phase 1b·1c 변경은 같은 미커밋 작업 트리에 유지됩니다. 새로운 제품 성능 표본은 수집하지 않았으며 최종 head의 성능 판정은 Phase 2에 남습니다.

Phase 2에서는 최종 stage head로 rebase한 뒤 source/사전등록을 커밋하고 B/S를 새 clean Orca 체크아웃에서 빌드해야 합니다. clean-build-record.json에도 check:browser-results --audit-base=<preregisteredCommit> 감사를 적용합니다. Phase 1b 제목을 정리하면서 frozen-copy 재사용, C5 frame-total gate, D8 probe, Phase 1b “C5 … 8.35ms” 문장, Phase 1b 두 파일 무결성 문장 다섯 구절이 대체됨을 모두 명시해야 합니다. gate 코드 해시는 그 커밋에서 다시 고정하고 최종 smoke의 F=B를 확인해야 합니다.

정식 창, Phase 2 빌드, rebase, 커밋은 실행하지 않았습니다. 코디네이터의 검토를 위해 prepared-1d를 보고한 뒤 중지합니다.
