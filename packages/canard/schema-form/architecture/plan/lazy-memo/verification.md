# W4·W1 검증 계획

- 기준55055f65b에서 특성화 통과와 계수 red를 구분하여 저장합니다. red가 통과하거나 특성화가 실패하면 코디네이터에게 escalation합니다.
- W4 순차 oracle와 단일 pass의 모든 맵·참조·집합·global 관측을 비교하고 W1 render/react18에서 기존과 같은 관측 변화를 확인합니다.
- M1–M4 각각의 실패 이유와 복원 해시를 저장합니다.
- lint 경고0·typecheck·정식 build, 일곱 Vitest 프로젝트와 importModel, 기준 원장/FCA·기계 경로·버전 감사를 순차 수행합니다.
- W4 merged/single과 W1 all/200-single/unsubscribed의 파일럿과 전체 실행 명령만 준비합니다. control 허용폭 max(0.3ms,3%), 부적합1회 재실행, 2회 부적합 void이며 후보별10%·1ms·control차이2배 초과 및 보조 셀 max(0.05ms,5%) 회귀 제한을 유지합니다.
