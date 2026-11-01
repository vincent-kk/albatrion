# 단계 마감 측정 — Phase 1 준비 결과

승인된 closing v1 및 Amendment 1·2와 C5 프레임 총합 확정을 구현했습니다. Phase 1의 최종 smoke는 24개 행, 97개 해당 lane/행 표본, 150회 연산을 완료했고 raw checker가 모두 재현했습니다. L은 23개 행(rebuild 제외), B/S/F는 각각 24개, D8 probe는 2개입니다. 노드 identity 검사는 전부 통과했으며 연산 슬롯 겹침과 raw 머신 경로는 각각 0건입니다.

사전등록 확정 커밋은 `125a820ee6ad17fdd1338b2ebf11cee61bf987ab`, 최종 harness 커밋은 `52253d1d1b91330e6dc76528871073f119ec837b`입니다. 규칙 버전은 `closing-v1-amendment-2`, SHA-256은 `bb019877f5a4f20b8871bfe8db4c38f1e1250b27886c8f71bb2944f67942cf6d`입니다. 사전등록과 registered rules는 `feef569410f064299134d00a9ab7baaf2ec81587`에서 함께 커밋했으며 C5 해석을 이후 추가했습니다.

압축 raw를 다음 명령으로 검증할 수 있습니다.

```sh
yarn workspace @aileron/benchmark-form check:browser-results --stage=closing --smoke --root=results/closing-prepared
```

전체 benchmark 검증은 13개 파일·83개 테스트 통과, 브라우저 타입 검사 통과, lint 경고 0건입니다. 원본 IR-6 checker는 main의 G2/G8 FAIL과 round-6의 전체 PASS를 그대로 재현했습니다. 기존 IR-6 판정 함수와 등록 규칙은 변경하지 않았습니다.

준비 중 첫 탐색 smoke는 규칙 포맷 변경 뒤 SHA 불일치로 checker가 거부했습니다. 다음 탐색 기록에서는 setTimeout의 조기 종료로 최대 0.3ms 슬롯 겹침이 검출되었습니다. 조기 종료를 모사한 테스트의 실패를 확인한 뒤 deadline 재확인으로 수정했습니다. 탐색 raw와 실패는 외부 고정 산출물에 보존하며 exploration 기록에 그 경과를 남겼습니다.

B/S는 Orca 임시 체크아웃에서 지정 build와 artifact 검사를 완료한 뒤 제품·브라우저 해시를 고정했습니다. 처음 B 타입 검사의 Ajv 해석 오류는 패키지 전용 기존 로컬 설치를 연결하여 해결했고 같은 build가 통과했습니다. 두 임시 워크트리와 브랜치를 모두 제거했습니다. 기존의 `stage-c5d963b2d` prunable 메타데이터는 이 작업에서 변경하지 않았습니다.

정식 측정 창은 0회입니다. F와 probe는 provisional smoke 빌드입니다. 최종 stage head를 대상으로 한 C0–C7 및 D8 성능 판정은 Phase 2에서 수행합니다. 코디네이터의 독립 검토와 go 이후 rebase하고 F/probe를 다시 빌드해야 합니다. 이 준비 결과는 병합 성능 판정을 포함하지 않습니다.

독립 검토 범위는 `779713587405b73abdd778df874fe21b726bac56` 이후 이 브랜치의 준비 변경입니다. 저장소 CLAUDE.md, 패키지 CLAUDE.md 및 `.claude/rules/`를 적용해 주십시오. 특히 원본 C7 재사용, Williams 4/5 lane 순서, L reset의 다른 연산 표시, 연산별 중앙값과 C5 프레임 총합의 구분, vsync 이중 조건, 고정 baseline의 provenance를 검토할 수 있습니다. 모든 규칙과 코드의 독립 검토는 코디네이터가 별도로 진행합니다.
