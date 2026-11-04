# 단계 마감 React 보고 원시

D4b의 기존 benchmark-form 러너를 제품 변경 없이 실행한 자료입니다. `S-1`·`S-2`는 단계 시작 제품, `E-1`·`E-2`는 제품 끝의 두 독립 통과입니다. 각 통과 안에서 L과 현재 판을 AB/BA 교대하며 같은 19픽스처에 10예열·100표본을 사용했습니다.

```sh
NODE_ENV=development yarn workspace @aileron/benchmark-form bench --equivalent --mode=render --legacy=0.16.1 --min-samples=100 --out=<output.json>
```

- `S/E-N.json.gz`: 판별 100개씩의 표본과 픽스처 순서입니다.
- `S/E-N-summary.json.gz`: 9지표의 중앙값·p99·비율·Welch 회귀 플래그입니다. 두 통과를 합치거나 가장 빠른 통과를 고르지 않았습니다.
- `S/E-N.log.gz`: 실행 로그입니다. 측정 디렉터리 주소는 휴대 가능한 표식으로 치환했습니다.
- `manifest.json.gz`: S/E의 출처·번들 4종 해시·명령·시작/종료·독립 PID·종료 코드·E 복원 증거입니다.
- `quiet.json.gz`·`starts.json.gz`: 첫 30초 quiet 관측과 정식 표본 0인 시작 관측입니다.
- `cpu.json.gz`: 시작 후 관측 전용 CPU 상위 10개입니다. 측정 자식도 포함될 수 있으며 실행 중단 판정에 쓰지 않았습니다.
- `core-test073.json`: Ⅳ-5의 기존 표본을 같은 처리량 수집과 Welch 함수로 후처리한 전체/앞반/뒤반 판정입니다. 새 코어 측정이 아닙니다.

값·DOM 동치 증명은 이 러너의 측정 범위가 아닙니다. 정착 장벽과 빈 장벽 차감의 정의, 모든 수치와 한계는 [마감 결과](../../closing-results.md)에 있습니다. 원장 검사와 보존물 검증은 시간 측정이 끝난 뒤 수행합니다.
