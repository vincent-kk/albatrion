# 우선순위 2 화면 플러그인 행 측정 결과

개선을 모두 병합한 뒤의 최종 값과 판정은 [RESULTS-FINAL.md](RESULTS-FINAL.md)에 있습니다. 이 문서는 그 전 단계의 측정 기록입니다.

기준 `1c77ced57`, 후보는 `1.0.0/optimize`의 개선을 PR #689까지 담은 트리입니다. `antd-mobile` 행의 기준은 `beta-am543`입니다. 비율은 후보 ÷ 기준이고 `min / p10` 순서입니다. 화면 플러그인의 한도는 1.5입니다. `출처`는 `results/` 아래 디렉터리입니다.

26행 중 24행이 한도 안입니다. 넘는 행은 `p2u-13`(antd6 분기 오류, 2.36, 24라운드 뒤에도 대조 p10이 1.049라 무효)과 `p2u-20`(antd-mobile 분기 오류, 1.78)입니다. 두 행은 이미 수용된 `p2c-02`(antd5 분기 오류, 1.79)와 같은 입력 모양입니다. `p2u-21`은 1.04로 한도 안이지만 대조 흔들림으로 무효입니다.

| 행 | 트리 쌍 | 기준 시간 | min / p10 | 대조 | 라운드 | 출처 |
|---|---|---|---|---|---|---|
| p2u-01 antd5 timeRangePanel | beta/opt | 20.6 ms | 0.975 / 0.960 | 1.007 / 1.001 | 12 | p2u-u1 |
| p2u-02 antd5 coreFormMount | beta/opt | 7.92 ms | 1.016 / 1.002 | 0.997 / 1.000 | 12 | p2u-u1 |
| p2u-03 antd5 coreEqualArray | beta/opt | 2.03 us | 0.954 / 0.947 | 0.990 / 0.995 | 12 | p2u-u1 |
| p2u-04 antd5 sliderMount | beta/opt | 4.68 ms | 1.016 / 1.022 | 1.003 / 1.003 | 12 | p2u-u1 |
| p2u-05 antd5 uriMount | beta/opt | 9.15 ms | 0.994 / 1.001 | 0.994 / 0.999 | 12 | p2u-u2 |
| p2u-06 antd5 multiEnumMount | beta/opt | 4.92 ms | 1.045 / 1.040 | 0.999 / 1.003 | 12 | p2u-u2 |
| p2u-07 antd5 coreOwnArray | beta/opt | 247 us | 1.091 / 1.096 | 1.000 / 0.998 | 24 | p2u-rerun-core |
| p2u-08 antd5 timeRangeMount | beta/opt | 5.38 ms | 0.999 / 0.992 | 0.997 / 1.003 | 12 | p2u-u2 |
| p2u-09 antd5 timeRangePanelPlain | beta/opt | 19.8 ms | 0.981 / 0.989 | 0.994 / 0.999 | 12 | p2u-u3 |
| p2u-10 antd6 sliderMount | beta/opt | 5.22 ms | 0.999 / 0.991 | 0.998 / 0.991 | 12 | p2u-u3 |
| p2u-11 antd6 uriMount | beta/opt | 8.05 ms | 1.037 / 1.033 | 1.004 / 1.001 | 12 | p2u-u3 |
| p2u-12 antd6 checkboxChange | beta/opt | 290 us | 0.710 / 0.697 | 1.011 / 1.008 | 12 | p2u-u3 |
| p2u-13 antd6 branchError | beta/opt | 114 us | 2.363 / 2.128 (무효) | 0.985 / 1.049 | 24 | p2u-rerun-core |
| p2u-14 antd6 timeRangeMount | beta/opt | 6.27 ms | 0.982 / 0.985 | 0.992 / 1.002 | 12 | p2u-u4 |
| p2u-15 antd6 timeRangePanel | beta/opt | 16.5 ms | 0.952 / 0.953 | 0.992 / 0.996 | 12 | p2u-u4 |
| p2u-16 am sliderMount | beta-am543/opt | 300 us | 0.993 / 0.993 | 1.004 / 1.005 | 24 | p2u-rerun-am |
| p2u-17 am radioMount | beta-am543/opt | 279 us | 1.005 / 0.993 | 1.015 / 1.005 | 24 | p2u-rerun-am |
| p2u-18 am rangeSliderChange | beta-am543/opt | 123 us | 1.146 / 1.120 | 1.017 / 0.995 | 12 | p2u-am1 |
| p2u-19 am checkboxChange | beta-am543/opt | 109 us | 1.032 / 1.055 | 1.006 / 0.998 | 12 | p2u-am1 |
| p2u-20 am branchError | beta-am543/opt | 31.6 us | 1.779 / 1.594 | 1.008 / 1.002 | 12 | p2u-am2 |
| p2c-05 am sliderChange | beta-am543/opt | 96.1 us | 1.086 / 1.113 | 0.998 / 0.998 | 12 | p2u-am2 |
| p2u-21 mui datePickerMount | beta/opt | 1.68 ms | 1.039 / 1.016 (무효) | 1.004 / 0.974 | 24 | p2u-rerun-core |
| p2u-22 mui uriMount | beta/opt | 0.92 ms | 1.021 / 1.007 | 1.011 / 0.982 | 24 | p2u-rerun-core |
| p2u-23 mui datePickerPanel | beta/opt | 14.0 ms | 1.010 / 1.003 | 1.014 / 0.999 | 12 | p2u-u5 |
| p2u-24 mui sliderMount | beta/opt | 0.46 ms | 1.002 / 1.004 | 0.987 / 0.994 | 12 | p2u-u5 |
| p2u-25 mui sliderChange | beta/opt | 266 us | 1.019 / 1.046 | 1.013 / 1.015 | 12 | p2u-u4 |

## 결정

Vincent가 `p2u-13`과 `p2u-20`을 수용했습니다. 두 행에서 귀속을 따로 확인하지는 않았고, 이미 수용된 `p2c-02`와 같은 원인으로 봅니다.
