# 단계 마감 측정 — Phase 2a 준비

최종 stage `5df0bf2adb53e9764432a6e34de9c84b84e12da5` 위로 rebase하고 Amendments 3–7의 소스·사전등록을 `ba49b312ca8aed6c69550bf068b3e72c6f40c0fe`에 커밋했습니다. 버전은 closing-v3-amendment-6, 규칙 SHA-256은 `cc538cb41fb123be4ebf9ea67d1384bf40b068096cf9596a9c6db350b8687430`입니다. Phase 1b 제목을 정리하고 frozen-copy 재사용, C5 frame-total gate, D8 probe, Phase 1b C5 8.35ms 문장, 두 파일 무결성 문장 다섯 구절이 대체됨을 사전등록에 명시했습니다.

B `5d1348ed1`과 S `facd72a71`은 새 clean Orca 체크아웃에서 전체 build를 수행했습니다. F의 제품 소스 tree는 지정된 최종 stage와 같고 측정용 커밋의 소스에서 빌드했습니다. B/S/F 전체 build가 exitCode:0이며 제품·브라우저 해시는 inputs.json에 있습니다. 초기 타입 검사 실패와 의존성 연결 수정 후 성공도 clean-build-record.json에 보존합니다. 새 설치나 제품 소스 수정은 없었습니다. 이 기록과 동결 inputs는 `61e4442f1aac15edd9e8d68a66b0dac522934389`에 먼저 커밋한 뒤 B/S 임시 체크아웃 및 브랜치를 각각 두 개씩 제거했습니다. 기존 prunable metadata는 그대로입니다.

최종-head 전체 smoke는 24행·95개 kept page·150회 연산입니다. L은 rebuild를 제외하여 23개 page, B/S/F는 각각 24개 page입니다. 행·lane당 warmup 1개를 폐기하고 1개를 보존했습니다. 이는 정식 창의 성능 판정이 아닙니다. node identity, replace schema, 슬롯, 지표 및 순서의 raw 재현 검사가 통과했습니다.

validator work의 다섯 mount와 네 operation 비교가 모두 PASS입니다. F와 B의 compile/validate 평균이 아홉 행에서 같고 F unattributed는 0이며 예외 목록은 비어 있습니다. smoke-validator-work.json은 checker의 --smoke --write로 생성했으며 이후 압축 보존본에서도 재현했습니다. smoke 수집의 toolCommit은 `61e4442f1aac15edd9e8d68a66b0dac522934389`입니다. smoke 수집을 다시 실행하지 않았습니다.

경로 감사에서 커밋된 inputs의 1MiB 초과 source-tree proof diff가 기본 child-process stdout 버퍼를 넘는 ENOBUFS를 발견했습니다. 큰 tracked addition의 정상 입력과 맨 끝의 machine path를 검사하는 회귀 테스트가 기존 코드에서 실패하는 것을 확인한 뒤, 감사의 git diff 버퍼를 32MiB로 보완했습니다. 상한 초과 시 계속 실패합니다. 이 수정은 `6fcfb2c3867ebaec01b8e338550b442234798c63`이며 등록 판정 코드·규칙·제품·동결 브라우저·저장 smoke를 변경하지 않았습니다.

전체 benchmark-form 20개 파일·132개 테스트, 브라우저 타입 검사, lint 경고 0개가 통과했습니다. 보존본 smoke 검사와 사전등록 커밋 기준 경로 감사도 신규 machine path 0개로 통과했습니다. checks.json에 명령과 결과가 있습니다. 재현 명령은 저장소 루트에서 다음과 같습니다.

```sh
yarn workspace @aileron/benchmark-form check:browser-results --stage=closing --root=results/closing-prepared-2a --smoke --audit-base=ba49b312ca8aed6c69550bf068b3e72c6f40c0fe
```

smoke-complete.json.gz 및 smoke-pages.json.gz가 저장 raw의 정본이며 archive-manifest.json은 보존 파일의 해시를 기록합니다. integrity-preflight.json은 수집 당시, integrity-ready.json은 감사 도구 보완 후 커밋 상태에서 non-test decision 파일의 current SHA=manifest SHA=git blob SHA 및 등록 이후 diff 없음의 근거입니다. 정식 창의 formal-start 해시는 시작 직전에 새로 기록해야 합니다.

정식 창, quiet-window 시도, push 및 PR 생성은 실행하지 않았습니다. 코디네이터의 다음 go를 기다립니다. 제품 소스·패키지 버전·lockfile은 최종 stage와 동일합니다. rebase 전 Phase 1d stash는 이전 측정 커밋과 후보의 로컬 복구용으로 보존합니다.
