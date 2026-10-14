# 필드의 fibers와렌더 기록입니다.

원본 count harness를 버전마다 9개 새 프로세스에서 실행했습니다. 별도의 인스턴스 식별 추적도 버전마다 9회 실행했습니다. 각 집합은 18개 프로세스로 구성됩니다. 식별 추적의 단언 결과는 {"isolatedOtherFields":540,"globalInstancesOnce":3600,"globalInputsOnce":432,"globalNoRemount":108}이며 실패는 없습니다.
평면의각 leaf는24→20 fibers이고 배열의기존각 leaf는21→17 fibers입니다. 필드 컴포넌트 수는13→10입니다. fibers에는host 및context 경계가 포함되며 렌더 분모에는컴포넌트만 사용했습니다.
자기 필드 input write의필드 렌더 합계는10→10입니다. sibling 및parent write에서변경 대상이아닌leaf의렌더는0이라고단언했습니다. 전역변경에서렌더된각logical field component는1회만렌더하며leaf input도1회이고remount는없다고단언했습니다. memo가건너뛴컴포넌트는0회이므로전체13개또는10개컴포넌트가항상모두렌더한다고해석할수는없습니다.
컴포넌트유형별write당렌더와정규화분모는fa-components.csv에기록했습니다. 같은유형의인스턴스가여러개면유형의합계를그유형의필드컴포넌트수로나눕니다. 평균과별개로raw의byInstance에서각렌더인스턴스가1회임을검증했습니다. 새로생긴필드의초기분모가없으면CSV분모는빈칸입니다.

| 버전과 시나리오 | write | 필드별 렌더 | 필드별 정규화 | remount | 새 mount |
|---|---|---|---|---|---|
| base flat/ctl | input write /a | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/ctl | input write /a again | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/ctl | sibling setValue /b | {"":10,"/b":10} | {"/a":0,"/b":0.7692307692307693,"/o/x":0,"/o/y":0} | ["/b"] | [] |
| base flat/ctl | same-value setValue /b | {} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/ctl | parent setValue /o (x only) | {"":10,"/o":10,"/o/x":10} | {"/a":0,"/b":0,"/o/x":0.7692307692307693,"/o/y":0} | ["/o/x"] | [] |
| base flat/ctl | whole setValue (a only) | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| base flat/ctl | refresh /a | {"/a":5} | {"/a":0.38461538461538464,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| base flat/ctl | showError(true) | {"(form)":9,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | [] | [] |
| base flat/ctl | Form context prop change | {"(form)":14,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | [] | [] |
| base flat/ctl | Form re-render, new inline onChange | {"(form)":14,"":3} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/ctl | Form readOnly prop true | {"(form)":14,"":8,"/a":5,"/b":5,"/o":5,"/o/x":5,"/o/y":5} | {"/a":0.38461538461538464,"/b":0.38461538461538464,"/o/x":0.38461538461538464,"/o/y":0.38461538461538464} | [] | [] |
| base flat/ctl | reset() | {"(form)":9,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | ["/a","/b","/o/x","/o/y"] | [] |
| base flat/unctl | input write /a | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/unctl | input write /a again | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/unctl | sibling setValue /b | {"":10,"/b":10} | {"/a":0,"/b":0.7692307692307693,"/o/x":0,"/o/y":0} | ["/b"] | [] |
| base flat/unctl | same-value setValue /b | {} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/unctl | parent setValue /o (x only) | {"":10,"/o":10,"/o/x":10} | {"/a":0,"/b":0,"/o/x":0.7692307692307693,"/o/y":0} | ["/o/x"] | [] |
| base flat/unctl | whole setValue (a only) | {"":10,"/a":10} | {"/a":0.7692307692307693,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| base flat/unctl | refresh /a | {"/a":5} | {"/a":0.38461538461538464,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| base flat/unctl | showError(true) | {"(form)":9,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | [] | [] |
| base flat/unctl | Form context prop change | {"(form)":14,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | [] | [] |
| base flat/unctl | Form re-render, new inline onChange | {"(form)":14,"":3} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| base flat/unctl | Form readOnly prop true | {"(form)":14,"":8,"/a":5,"/b":5,"/o":5,"/o/x":5,"/o/y":5} | {"/a":0.38461538461538464,"/b":0.38461538461538464,"/o/x":0.38461538461538464,"/o/y":0.38461538461538464} | [] | [] |
| base flat/unctl | reset() | {"(form)":9,"":12,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":0.7692307692307693,"/b":0.7692307692307693,"/o/x":0.7692307692307693,"/o/y":0.7692307692307693} | ["/a","/b","/o/x","/o/y"] | [] |
| base array/ctl | push | {"":10,"/arr":17,"/arr/3":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| base array/ctl | push again | {"":10,"/arr":18,"/arr/4":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/4"] |
| base array/ctl | remove(0) | {"":10,"/arr":16,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":0.7692307692307693,"/arr/1":0.7692307692307693,"/arr/2":0.7692307692307693} | [] | [] |
| base array/ctl | remove(last) | {"":10,"/arr":15} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | [] |
| base array/ctl | replace setValue (+1 item) | {"":10,"/arr":17,"/arr/3":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| base array/ctl | replace setValue (all new values) | {"":10,"/arr":10,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":0.7692307692307693,"/arr/1":0.7692307692307693,"/arr/2":0.7692307692307693} | ["/arr/0","/arr/1","/arr/2","/arr/3"] | [] |
| base array/unctl | push | {"":10,"/arr":17,"/arr/3":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| base array/unctl | push again | {"":10,"/arr":18,"/arr/4":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/4"] |
| base array/unctl | remove(0) | {"":10,"/arr":16,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":0.7692307692307693,"/arr/1":0.7692307692307693,"/arr/2":0.7692307692307693} | [] | [] |
| base array/unctl | remove(last) | {"":10,"/arr":15} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | [] |
| base array/unctl | replace setValue (+1 item) | {"":10,"/arr":17,"/arr/3":13} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| base array/unctl | replace setValue (all new values) | {"":10,"/arr":10,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":0.7692307692307693,"/arr/1":0.7692307692307693,"/arr/2":0.7692307692307693} | ["/arr/0","/arr/1","/arr/2","/arr/3"] | [] |
| fap flat/ctl | input write /a | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/ctl | input write /a again | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/ctl | sibling setValue /b | {"(form)":1,"":9,"/b":10} | {"/a":0,"/b":1,"/o/x":0,"/o/y":0} | ["/b"] | [] |
| fap flat/ctl | same-value setValue /b | {} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/ctl | parent setValue /o (x only) | {"(form)":1,"":9,"/o":10,"/o/x":10} | {"/a":0,"/b":0,"/o/x":1,"/o/y":0} | ["/o/x"] | [] |
| fap flat/ctl | whole setValue (a only) | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| fap flat/ctl | refresh /a | {"/a":5} | {"/a":0.5,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| fap flat/ctl | showError(true) | {"(form)":9,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | [] | [] |
| fap flat/ctl | Form context prop change | {"(form)":14,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | [] | [] |
| fap flat/ctl | Form re-render, new inline onChange | {"(form)":14,"":2} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/ctl | Form readOnly prop true | {"(form)":14,"":7,"/a":5,"/b":5,"/o":5,"/o/x":5,"/o/y":5} | {"/a":0.5,"/b":0.5,"/o/x":0.5,"/o/y":0.5} | [] | [] |
| fap flat/ctl | reset() | {"(form)":9,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | ["/a","/b","/o/x","/o/y"] | [] |
| fap flat/unctl | input write /a | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/unctl | input write /a again | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/unctl | sibling setValue /b | {"(form)":1,"":9,"/b":10} | {"/a":0,"/b":1,"/o/x":0,"/o/y":0} | ["/b"] | [] |
| fap flat/unctl | same-value setValue /b | {} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/unctl | parent setValue /o (x only) | {"(form)":1,"":9,"/o":10,"/o/x":10} | {"/a":0,"/b":0,"/o/x":1,"/o/y":0} | ["/o/x"] | [] |
| fap flat/unctl | whole setValue (a only) | {"(form)":1,"":9,"/a":10} | {"/a":1,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| fap flat/unctl | refresh /a | {"/a":5} | {"/a":0.5,"/b":0,"/o/x":0,"/o/y":0} | ["/a"] | [] |
| fap flat/unctl | showError(true) | {"(form)":9,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | [] | [] |
| fap flat/unctl | Form context prop change | {"(form)":14,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | [] | [] |
| fap flat/unctl | Form re-render, new inline onChange | {"(form)":14,"":2} | {"/a":0,"/b":0,"/o/x":0,"/o/y":0} | [] | [] |
| fap flat/unctl | Form readOnly prop true | {"(form)":14,"":7,"/a":5,"/b":5,"/o":5,"/o/x":5,"/o/y":5} | {"/a":0.5,"/b":0.5,"/o/x":0.5,"/o/y":0.5} | [] | [] |
| fap flat/unctl | reset() | {"(form)":9,"":9,"/a":10,"/b":10,"/o":10,"/o/x":10,"/o/y":10} | {"/a":1,"/b":1,"/o/x":1,"/o/y":1} | ["/a","/b","/o/x","/o/y"] | [] |
| fap array/ctl | push | {"(form)":1,"":9,"/arr":17,"/arr/3":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| fap array/ctl | push again | {"(form)":1,"":9,"/arr":18,"/arr/4":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/4"] |
| fap array/ctl | remove(0) | {"(form)":1,"":9,"/arr":16,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":1,"/arr/1":1,"/arr/2":1} | [] | [] |
| fap array/ctl | remove(last) | {"(form)":1,"":9,"/arr":15} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | [] |
| fap array/ctl | replace setValue (+1 item) | {"(form)":1,"":9,"/arr":17,"/arr/3":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| fap array/ctl | replace setValue (all new values) | {"(form)":1,"":9,"/arr":10,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":1,"/arr/1":1,"/arr/2":1} | ["/arr/0","/arr/1","/arr/2","/arr/3"] | [] |
| fap array/unctl | push | {"(form)":1,"":9,"/arr":17,"/arr/3":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| fap array/unctl | push again | {"(form)":1,"":9,"/arr":18,"/arr/4":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/4"] |
| fap array/unctl | remove(0) | {"(form)":1,"":9,"/arr":16,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":1,"/arr/1":1,"/arr/2":1} | [] | [] |
| fap array/unctl | remove(last) | {"(form)":1,"":9,"/arr":15} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | [] |
| fap array/unctl | replace setValue (+1 item) | {"(form)":1,"":9,"/arr":17,"/arr/3":10} | {"/arr/0":0,"/arr/1":0,"/arr/2":0} | [] | ["/arr/3"] |
| fap array/unctl | replace setValue (all new values) | {"(form)":1,"":9,"/arr":10,"/arr/0":10,"/arr/1":10,"/arr/2":10,"/arr/3":10} | {"/arr/0":1,"/arr/1":1,"/arr/2":1} | ["/arr/0","/arr/1","/arr/2","/arr/3"] | [] |

refresh latency는외부leaf setValue부터commit 내DOM input setter 또는placement까지측정했습니다. 시나리오와버전마다72개표본을합쳤습니다. 타이밍중에는counting을끄며105C-01의판정열로사용하지않았습니다.

| 시나리오 | base median/p99 µs | F-A′ median/p99 µs | median 비율 |
|---|---:|---:|---:|
| flat/ctl | 345.916/1212.791 | 349.750/1309.125 | 1.011084 |
| flat/unctl | 280.375/367.541 | 263.375/383.500 | 0.939367 |
| array/ctl | 310.458/544.375 | 292.917/542.709 | 0.943500 |
| array/unctl | 298.708/416.916 | 307.125/406.000 | 1.028178 |
