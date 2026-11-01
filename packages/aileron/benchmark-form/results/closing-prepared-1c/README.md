# 단계 마감 측정 — Phase 1c 준비

Amendment 5·6을 적용한 미커밋 준비입니다. 버전은 closing-v3-amendment-6이며 규칙 SHA-256은 `cc538cb41fb123be4ebf9ea67d1384bf40b068096cf9596a9c6db350b8687430`입니다. HEAD는 ce1066b335bd6d66b95c308962dda7156ba7ea48로 유지하고, Phase 2에서 최종 stage head로 rebase한 뒤 소스와 사전등록을 커밋합니다.

C5 연산 프레임은 각 연산의 max(longestFrame,50ms)를 구한 뒤 페이지 중앙값으로 만듭니다. F/B 상한 >1.10 및 차이 상한 >16.7ms가 동시에 성립하면 실패합니다. C4 mount 절은 그대로입니다. 기존 최장 프레임과 frame counts는 보고 전용이며 양 lane의 LoAF 지원 누락은 불확정입니다. 0/0 resample의 비율은 1, 0/양수만 +Infinity입니다.

validator work 표는 plugin entry에서 자동으로 계산하고 JSON·tables.md·checker가 재현합니다. operation slot은 entry.start로 귀속하며 setup과 unattributed를 분리하고 slot 밖에서 끝난 entry도 포함합니다. mount의 1초 이후 entry는 전체 mean에 포함하며 따로 보고합니다. 네 operation row와 다섯 C4 mount row에서 F/B mean compile·validate 수가 같고 F unattributed가 0이어야 합니다. 예외 목록은 현재 비어 있으며 불일치는 FIX_REQUIRED입니다. Phase 2 최종 head smoke의 checker도 이 규칙을 통과해야 합니다.

operation row의 긴 프레임 연산 fraction은 kept page 전체에 pool합니다. F−B>0.20일 때 원인 진단을 요구하며 정확히 0.20인 경우 부동소수점 오차로 포함되지 않도록 정수 count의 교차 곱으로 비교합니다. operation의 longestFrame/flooredLongestFrame과 양 lane의 모든 페이지 값이 0인 지표는 timing ratio-band/difference-clause 진단에서 제외합니다.

무결성 검사는 모든 non-test decision code의 현재 SHA=toolHashes SHA=toolCommit git blob SHA를 요구합니다. gate, derive, decideVsyncBound, bootstrap helper의 네 키는 필수이며 등록 이후 diff 범위에 deriveValidationAfterPaintResults와 input-responsiveness fixtures를 포함합니다. clean-build-record.json은 inputs.json 옆에 두며 B/S의 commit, cleanProductScope:true, exitCode:0, product.sha256이 inputs에 일치해야 합니다.

검증은 전체 18개 파일·116개 테스트 통과, 브라우저 타입 검사 통과, lint 경고 0건입니다. 각 새 규칙의 red/green 근거는 prepared.json에 있습니다. C7 저장 raw 테스트는 파일 위치로 경로를 계산하여 저장소 루트와 workspace 실행 모두 통과했습니다. 원본 IR-6 main/round-6 판정은 그대로 재현했습니다.

historical-smoke-validator-work.json 및 historical-smoke-tables.md는 기존 Phase 1 raw에 v3 derive·render·직렬화를 연결해 검증한 자료입니다. work 표 35개 lane/행과 9개 F/B 비교가 계산되고 모두 일치했습니다. 이는 v3 정식 측정 창이나 최종 stage head의 성능 판정이 아닙니다.

Phase 2에서 B/S를 새 clean Orca 체크아웃에서 빌드하고 기록을 보존해야 합니다. Phase 1b 등록 제목 정리와 frozen-copy 재사용·C5 frame-total gate·D8 probe를 대체하는 설명도 Phase 2 커밋에서 확정합니다. 최종 smoke는 --stage=closing --smoke --write로 smoke-validator-work.json을 만들고, --smoke로 재현합니다. 정식 창, rebase, 커밋 및 Phase 2 B/S 빌드는 수행하지 않았습니다.
