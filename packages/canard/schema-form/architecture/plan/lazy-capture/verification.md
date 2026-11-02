# C1 구현 검증 계획

1. NODE-044·WRITE-085의 특성화 일곱 범주를 기존 제품에서 통과시키고 bulk 이탈의 포인터 캐시 삽입0 시험이 기존 제품에서 해당 이유로 실패하는지 확인합니다.
2. 직접 경로 읽기로 바꾼 뒤 focused green을 확인하고 캐시 재도입·이미 떼어진 fallback 제거·공급된 undefined를 nullish fallback으로 바꾸는 M1–M3를 각각 실패시킵니다. 변이마다 제품 바이트를 복원합니다.
3. lint 경고0·typecheck·정식 build, unit/render/react18/storybook/production/verify-unit/verify-render와 importModel을 순차 실행합니다.
4. 기준55055f65b와 전체 원장·FCA를 비교하며 기존 진단을 PASS로 바꾸지 않습니다. 변경 파일의 기계 경로와 package.json 버전 불변을 감사합니다.
5. 구현자는 성능을 재지 않습니다. 실제 후보의 수용 측정·독립 최종 검토·게시·병합은 후속입니다.
