# 상태 어휘 검증 계획

VALUE-044·NODE-067 및 [최종 설계](design.md)의 실행 관문입니다. [결과](../../verification/state-vocabulary/results.md)에 기준·후보·명령·횟수·한계를 기록합니다.

1. 기준 red의 새 심볼 부재 실패와 기존 guard 통과를 구별합니다. 현재 focused tests·59개 surface 멤버·실제 정적 첫 로드·모듈 spy를 검증합니다.
2. baseline 매 commit 이동·memo 키 제거·자식 reset 기준 이동·loadSnapshot 사용·structuredClone 기준·static-first 기준 대입 제거의 여섯 변이를 각각 실행하고 코드 복원을 확인합니다.
3. lint 경고0·typecheck·정식 build, unit/render/react18/storybook/production/verify-unit/verify-render, scenarios와 바뀐 ajv6/7/8 패키지 typecheck/tests, importModel을 순차 실행합니다.
4. 41파일 snapshot 역키 변환, X1 전량 분류·AST 잔여0, machine path·package 버전 불변을 확인합니다.
5. merged base 대비 전체 원장 관문과 FCA를 비교합니다. 기존 미인용·diagnostic을 통과로 바꾸지 않고 새 finding을 모두 기록합니다.
6. 성능은 별도 코디네이터 창입니다. 사전등록 BF/FB·SV-1·SV-2 및 heap/절대 읽기 시간은 설계 계약을 따르며 구현 시험으로 성능 PASS를 주장하지 않습니다.
