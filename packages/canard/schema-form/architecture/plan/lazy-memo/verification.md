# W4·W1 검증 계획

- 기준55055f65b에서 특성화 통과와 계수 red를 구분하여 저장합니다. red가 통과하거나 특성화가 실패하면 코디네이터에게 escalation합니다.
- W4 순차 oracle와 단일 pass의 모든 맵·참조·집합·global 관측을 비교하고 W1 render/react18에서 기존과 같은 관측 변화를 확인합니다.
- M1–M4 각각의 실패 이유와 복원 해시를 저장합니다.
- lint 경고0·typecheck·정식 build, 일곱 Vitest 프로젝트와 importModel, 기준 원장/FCA·기계 경로·버전 감사를 순차 수행합니다.
- W4 merged/single과 W1 all/200-single/unsubscribed의 전체12 warmup·60 runs,5셀15프로세스를 완료하여 W4 ACCEPT·W1 ACCEPT입니다. control 허용폭 max(0.3ms,3%), 부적합1회 재실행·다시 부적합 VOID, 주 셀10%·1ms 이상 및 control차이2배 초과, 보조 셀 max(0.05ms,5%) 회귀 제한을 적용했습니다. 전부 첫 시도 유효, 재시도·VOID·overlap0이며 exit0·97.282099초입니다. 반올림 없는5셀과 quiet check·실행 영수증은 `verification/lazy-memo/results.md` 및 raw/accept-full-*를 따릅니다.
