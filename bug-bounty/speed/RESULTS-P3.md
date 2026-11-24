# 우선순위 3 측정 결과

기준 `1c77ced57`, 후보는 `1.0.0/optimize`의 개선을 PR #689까지 담은 트리입니다. 비율은 후보 ÷ 기준이고 `min / p10` 순서입니다. 한도는 기준 시간 한 번이 1 ms 이상이면 1.05, 1 µs~1 ms면 1.35, 1 µs 미만이면 3배입니다. `출처`는 `results/` 아래 디렉터리입니다.

`p3-11`과 `p3-17`은 기준 트리에서 유효한 입력이 되지 못해 후보끼리만 쟀고 비율이 없습니다. `p3-18`은 PR #691, #692까지 담은 트리로 다시 잰 값입니다.

| 행 | 패키지 | 입력 종류 | 기준 시간 | min / p10 | 대조 | 라운드 | 출처 | 판정 |
|---|---|---|---|---|---|---|---|---|
| p3-01 ajv7 root-id compile | ajv7-plugin | repaired | 1.48 ms | 1.068 / 1.074 | 1.003 / 1.000 | 24 | p3-rerun-ajv7 | 초과 (1.05) |
| p3-02 ajv7 bind-compile | ajv7-plugin | repaired | 1.45 ms | 1.077 / 1.077 | 1.002 / 0.999 | 24 | p3-rerun-ajv7 | 초과 (1.05) |
| p3-03 ajv7 factory-compile | ajv7-plugin | repaired | 1.45 ms | 1.082 / 1.079 | 1.003 / 0.999 | 24 | p3-rerun-ajv7 | 초과 (1.05) |
| p3-04 ajv7 factory-fresh | ajv7-plugin | repaired | 1.47 ms | 1.079 / 1.083 | 1.003 / 0.998 | 24 | p3-rerun-ajv7 | 초과 (1.05) |
| p3-05 ajv8 factory-fresh | ajv8-plugin | repaired | 1.52 ms | 1.024 / 1.021 | 0.997 / 1.004 | 24 | p3-rerun-mix | 통과 |
| p3-06 anchor ssr initial errors | schema-form | repaired | 10.3 us | 1.247 / 1.196 | 0.997 / 1.006 | 12 | p3-a | 통과 |
| p3-07 overlap array 32-4 | schema-form | repaired | 108.5 us | 1.191 / 1.166 | 1.011 / 0.992 | 12 | p3-a | 통과 |
| p3-08 json getValue fragment | @winglet/json | repaired | 52 ns | 4.232 / 4.211 | 0.997 / 1.001 | 12 | p3-a | 초과 (3배) |
| p3-09 ab derive overlap | schema-form | repaired | 16.7 us | 1.192 / 1.192 | 1.001 / 0.998 | 12 | p3-a | 통과 |
| p3-10 reset refused 8 | schema-form | repaired | 111.5 us | 1.229 / 1.231 | 1.010 / 1.006 | 12 | p3-b | 통과 |
| p3-11 expr return regexp | schema-form | repaired | 67.6 us (후보만) | 1.015 / 0.998 (후보끼리, 비율 없음) | 1.012 / 1.000 | 24 | p3-rerun-single-opt | 비교 불가 |
| p3-12 validate writeback | schema-form | repaired | 1.64 us | 1.198 / 1.224 | 0.999 / 0.997 | 24 | p3-rerun-mix | 통과 |
| p3-13 engine validate writeback | schema-form | repaired | 1.45 us | 1.223 / 1.224 | 1.003 / 1.008 | 12 | p3-b | 통과 |
| p3-14 r2 client array external | schema-form | repaired | 31.8 us | 1.336 / 1.337 | 0.994 / 0.997 | 24 | p3-rerun-mix | 통과 (한도에 0.014 못 미침) |
| p3-15 r3 batch array | schema-form | repaired | 26.4 us | 0.493 / 0.498 | 1.001 / 0.999 | 12 | p3-c | 통과 (더 빠름) |
| p3-16 validate writeback errors | schema-form | repaired | 3.35 us | 1.550 / 1.526 | 0.990 / 0.990 | 12 | p3-c | 초과 (1.35) |
| p3-17 r2 async relay content | schema-form | repaired | 3.36 us (후보만) | 1.000 / 0.996 (후보끼리, 비율 없음) | 1.001 / 0.995 | 24 | p3-rerun-single-opt | 비교 불가 |
| p3-18 schema alternate lookup | @winglet/json-schema | repaired | 1.06 us | 5.026 / 5.038 | 1.006 / 1.008 | 12 | p3-18-after-691 | 초과 (1.35) |
| p3-19 ajv6 bound first id resource invalid | ajv6-plugin | repaired | 508 ns | 8.272 / 7.826 | 1.010 / 1.005 | 12 | p3-c | 초과 (3배) |
