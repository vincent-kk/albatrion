# 단계 마감 측정 — Phase 1b 준비

Amendment 3·4를 적용한 미커밋 작업입니다. HEAD는 `ce1066b335bd6d66b95c308962dda7156ba7ea48`로 유지합니다. 사전등록 버전은 `closing-v2-amendment-3`, 현재 규칙 SHA-256은 `23299a3a4a2516f211ac6257d033dbd5f230b2eb1fb03e68777e324d7cd0905c`입니다. 최종 stage head로 rebase한 뒤 그 위에 소스와 사전등록을 커밋해야 합니다.

C4/C5의 프레임 판정은 최장 프레임의 bootstrap 비율·차이 이중 조건으로 바뀌었고 프레임 수는 보고 전용입니다. settled validate의 resolutionTime에도 이중 조건을 적용합니다. B가 0인 경우 +Infinity를 JSON 문자열로 보존하고 독립 차이 상한이 8.35ms를 넘으면 실패, 그렇지 않으면 통과합니다. 양쪽 0은 통과하며 LoAF 지원 누락은 불확정입니다. C2/C6의 원래 프레임 수 조건과 C7 원본 round-6 판정은 유지합니다.

postPaintBusy는 반환 뒤 첫 rAF인 paintBoundary부터 계산하고 nextPainted는 double rAF로 유지합니다. F replace smoke 10회에서 compile+validate 합의 중앙값과 postPaintBusy 중앙값이 모두 15.0ms이며 합산 오차는 0ms입니다. raw에는 각 연산의 경계, compile/validate duration, LoAF가 들어 있습니다. 이 smoke는 현재 임시 F에서 수행한 계측 확인이며 정식 성능 판정은 아닙니다.

D8은 mounted field의 listeners 때문에 latch가 payload 생략을 바꾸지 않는다는 trace 결정으로 종료했고 probe를 제거했습니다. 모든 행이 4-lane Williams 순서를 사용하고 lane별 실제 위치 횟수를 출력합니다. B/S frozen baseline 재사용 경로는 제거했습니다. Phase 2에서 B/S를 깨끗한 Orca 체크아웃에서 새로 빌드하고, 경로를 정리한 build 기록을 inputs.json 옆에 커밋해야 합니다.

checker는 현재 gate/derive 해시를 formal-start.toolHashes에 묶고, 등록 commit부터 tool commit까지 stageClosing·derive·validationAfterPaint·summarize 경로에 변경이 없음을 검사합니다. 진단 목록에는 기존 비율 구간 외에 비율이 1.10을 넘지만 차이 조건으로 통과한 지표도 포함합니다. 사전등록 초안은 architecture 계획 문서에 추가했으며 Phase 2 이전에는 커밋하지 않습니다.

검증: 전체 15개 파일·98개 테스트 통과, 브라우저 타입 검사 통과, lint 경고 0건입니다. 수정 전 gate/paintBoundary 및 zero-reference 사례의 실패를 확인했고 수정 후 통과했습니다. 현재 gate/derive 편집 거부와 대상 경로별 commit drift 거부를 포함한 무결성 테스트 7개가 통과했습니다. 테스트 명령은 `yarn workspace @aileron/benchmark-form test`입니다.

기존 v1 준비 기록은 보존합니다. 현재 v2 checker는 버전·SHA가 다른 v1 기록을 v2 기록으로 받아들이지 않습니다. 정식 창, Phase 2 rebase/commit, B/S 재빌드는 아직 수행하지 않았습니다. 명령 입력 실수로 기본 yarn이 한 번 실행됐지만 추적 package 명세와 yarn.lock의 변경은 0건입니다.
