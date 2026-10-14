# React 렌더 계수를 기록합니다.

원도구의 동일 컴포넌트 이름은 합쳐 집계됩니다. 별도 assertions.json은 fiber와 alternate의 인스턴스 ID로 전역 context 단언을 검증합니다.

| 시나리오/모드 | 쓰기 | base 렌더/target 렌더 | F-A' 렌더/target 렌더 | base/F-A' 입력 재마운트 | base/F-A' 새 입력 마운트 | base/F-A' 생성 fiber |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| flat/ctl | input write /a | 20/10 | 20/10 | 0/0 | 0/0 | 0/0 |
| flat/ctl | input write /a again | 20/10 | 20/10 | 0/0 | 0/0 | 0/0 |
| flat/ctl | sibling setValue /b | 20/10 | 20/10 | 1/1 | 0/0 | 2/2 |
| flat/ctl | same-value setValue /b | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| flat/ctl | parent setValue /o (x only) | 30/10 | 30/10 | 1/1 | 0/0 | 2/2 |
| flat/ctl | whole setValue (a only) | 20/10 | 20/10 | 1/1 | 0/0 | 2/2 |
| flat/ctl | refresh /a | 5/5 | 5/5 | 1/1 | 0/0 | 2/2 |
| flat/ctl | showError(true) | 71/— | 68/— | 0/0 | 0/0 | 0/0 |
| flat/ctl | Form context prop change | 76/— | 73/— | 0/0 | 0/0 | 0/0 |
| flat/ctl | Form re-render, new inline onChange | 17/— | 16/— | 0/0 | 0/0 | 0/0 |
| flat/ctl | Form readOnly prop true | 47/— | 46/— | 0/0 | 0/0 | 0/0 |
| flat/ctl | reset() | 71/— | 68/— | 4/4 | 0/0 | 8/8 |
| flat/unctl | input write /a | 20/10 | 20/10 | 0/0 | 0/0 | 0/0 |
| flat/unctl | input write /a again | 20/10 | 20/10 | 0/0 | 0/0 | 0/0 |
| flat/unctl | sibling setValue /b | 20/10 | 20/10 | 1/1 | 0/0 | 2/2 |
| flat/unctl | same-value setValue /b | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| flat/unctl | parent setValue /o (x only) | 30/10 | 30/10 | 1/1 | 0/0 | 2/2 |
| flat/unctl | whole setValue (a only) | 20/10 | 20/10 | 1/1 | 0/0 | 2/2 |
| flat/unctl | refresh /a | 5/5 | 5/5 | 1/1 | 0/0 | 2/2 |
| flat/unctl | showError(true) | 71/— | 68/— | 0/0 | 0/0 | 0/0 |
| flat/unctl | Form context prop change | 76/— | 73/— | 0/0 | 0/0 | 0/0 |
| flat/unctl | Form re-render, new inline onChange | 17/— | 16/— | 0/0 | 0/0 | 0/0 |
| flat/unctl | Form readOnly prop true | 47/— | 46/— | 0/0 | 0/0 | 0/0 |
| flat/unctl | reset() | 71/— | 68/— | 4/4 | 0/0 | 8/8 |
| array/ctl | push | 40/17 | 37/17 | 0/0 | 1/1 | 26/22 |
| array/ctl | push again | 41/18 | 38/18 | 0/0 | 1/1 | 26/22 |
| array/ctl | remove(0) | 66/16 | 66/16 | 0/0 | 0/0 | 0/0 |
| array/ctl | remove(last) | 25/15 | 25/15 | 0/0 | 0/0 | 0/0 |
| array/ctl | replace setValue (+1 item) | 40/17 | 37/17 | 0/0 | 1/1 | 26/22 |
| array/ctl | replace setValue (all new values) | 60/10 | 60/10 | 4/4 | 0/0 | 8/8 |
| array/unctl | push | 40/17 | 37/17 | 0/0 | 1/1 | 26/22 |
| array/unctl | push again | 41/18 | 38/18 | 0/0 | 1/1 | 26/22 |
| array/unctl | remove(0) | 66/16 | 66/16 | 0/0 | 0/0 | 0/0 |
| array/unctl | remove(last) | 25/15 | 25/15 | 0/0 | 0/0 | 0/0 |
| array/unctl | replace setValue (+1 item) | 40/17 | 37/17 | 0/0 | 1/1 | 26/22 |
| array/unctl | replace setValue (all new values) | 60/10 | 60/10 | 4/4 | 0/0 | 8/8 |

리프레시 지연은 DOM 입력 value setter/placement 안에서 관측한 쓰기→반영 시간입니다. 각 조건의 8표본 계측 기록이므로 공식 24블록 판정 열과 별도로 해석합니다.

| 조건 | base 중앙값(µs) | F-A' 중앙값(µs) | F-A'/base |
| --- | ---: | ---: | ---: |
| flat/ctl | 309.833000000 | 384.708500000 | 1.241664058 |
| flat/unctl | 278.812500000 | 241.125500000 | 0.864830307 |
| array/ctl | 310.062000000 | 280.375000000 | 0.904254633 |
| array/unctl | 306.791500000 | 311.125000000 | 1.014125228 |
