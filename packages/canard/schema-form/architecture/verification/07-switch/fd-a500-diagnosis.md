# F-D의 array-500 갱신 손실 진단

대상은 세션 132f에서 확인된 F-D의 회귀입니다([판정 기록](profile-132f-session.md)). array-500/off/update의 강제 gc 판정 열(update-wall, update-active)에서 F-D가 약 50 µs 느렸습니다. 첫 측정은 −48~−51 µs, 확인 측정은 −53 µs였고, 둘 다 24블록입니다. 진단은 읽기 전용 Opus debugger(high)가 했고, 저장소는 바꾸지 않았습니다. Node는 nvm v26.11.1입니다. 도구와 원자료는 세션 scratchpad의 `fd-a500-diag/`에 있습니다(`probe.mjs`, `drive.mjs`, `counts.mjs`, GC 추적 `trace30-*.log`). 부호는 기준 − F-D이고, 음수가 F-D가 느린 쪽입니다.

## 결론

**갱신 중에는 F-D 코드가 한 번도 돌지 않습니다.** 손실은 갱신 시간 창 안에서 매번 일어나는 젊은 세대 GC(scavenge)가 F-D에서 조금 더 오래 걸려서 생깁니다. 이 GC가 더 오래 걸리는 까닭은, F-D가 마운트 때 행마다 객체를 조금 더 보유하기 때문입니다.

- 강제 gc 열에서는 마운트 전에 전체 gc를 강제하므로(`tools/measure-react-pair-129.mjs:154`), 마운트 직후 힙의 위치가 매번 같습니다. 그래서 쓰기 한 번(약 341 KB 할당)이 new space를 넘기고, "allocation failure" scavenge 하나가 양쪽 모두 갱신 창의 100%(30/30)에 들어갑니다. 이 scavenge는 2.6~2.8 ms로, update-wall 약 3.9 ms의 대부분입니다.
- F-D는 마운트에서 약 0.3 MB를 더 보유합니다. 행당 약 0.6~0.7 KB이며, memo fiber, hook, 콜백, props입니다. 그래서 창 안 scavenge의 생존 바이트가 672 KB에서 862 KB로 약 190 KB(+28%) 늘고, 병렬 scavenge 시간이 1.86 ms에서 2.00 ms로 늡니다.
- gc 없는 짝 열이 0을 포함하는 까닭은, 그 경로가 쓰기 전에 시계 밖에서 minor gc를 하기 때문입니다(`:168`). 세션 132f의 gc 없는 갱신 창 1,968개 중 GC가 겹친 창은 0개였습니다.

## 근거

1. **쓰기 한 번의 React 내부 호출 수**(react-dom-profiling에 계수기, 3회 반복 모두 같음). 기준과 F-D가 모두 같습니다.
   - `beginWork` 603, `bailoutOnAlreadyFinishedWork` 536, `renderWithHooks` 32, `updateSimpleMemoComponent` 9, `shallowEqual` 9, `completeWork` 603, `commitRoot` 1, `commitHostUpdate`·`updateProperties` 22, `commitHookEffectListMount` 16입니다.
   - 갱신 중 `RemoveButton`과 `Button`의 렌더는 0입니다. 각 행의 RemoveButton fiber는 방문되지만, props identity가 같아 비교 전에 bailout합니다.
   - 그러므로 계수 파일의 "작업 계수 0"은 비교 작업이나 템플릿 재렌더를 놓친 것이 아닙니다. 다만 이 계수는 마운트 때 보유한 객체가 나중 GC에 주는 비용을 재지 않습니다.
2. **짝 측정으로 재현.** 프로세스마다 번들 하나, ABBA 순서, 예열 10, 표본 30으로 17쌍을 쟀습니다. update-wall 차이의 중앙값은 −44 µs, bootstrap 95% 구간은 [−109, −19] µs이고, 17쌍 중 13쌍이 음수였습니다.
3. **결정 대조.** 같은 조건에서 마운트 뒤, 시계 밖에서 minor gc를 하나 넣었습니다. 창 안 GC가 0이 되었고, 차이는 중앙값 +2 µs, 구간 [−11, +21] µs, 17쌍 중 8쌍 음수였습니다. 쓰기당 할당은 341.1 KB 대 341.1 KB로 같습니다.
4. **GC 추적**(`--trace-gc-nvp`). 양쪽 모두 창마다 scavenge가 정확히 하나였고, 정지 시간의 중앙값은 2.69 ms 대 2.79 ms였습니다. 마운트 뒤 힙 사용량은 F-D가 304~349 KB 많았습니다.

## 사용자가 보는 비용

- 보유량 증가 자체는 실제 비용입니다. 행 500개를 마운트하면, 마운트 뒤 처음 일어나는 scavenge 한두 번에서 약 50~100 µs를 한 번 냅니다. 그 시점은 정해져 있지 않습니다.
- 정상 상태의 갱신에는 비용이 없습니다(minor gc 대조에서 차이 0).

## 고침의 선택지

1. **측정 쪽.** 강제 gc 열에서도 쓰기 전에 시계 밖 minor gc를 넣습니다. 그러면 마운트 보유량의 GC 비용이 첫 갱신 창에 실리지 않습니다. 이 경우 지금의 gc 없는 열이 실제로는 "쓰기 전 minor gc" 조건이라는 점도 기록해야 합니다.
2. **F-D 쪽(검증 전).** 행당 보유량을 줄입니다. 예를 들어 `RemoveButton` 감싸개와 그 안의 `useCallback`을 없애고, memo Button 하나가 인덱스와 안정된 `onRemove`를 받게 해서, 행당 fiber·hook·클로저를 하나씩 줄입니다. 확인은 같은 17쌍 대조에서 차이가 0을 포함하는지, 마운트 힙 증가가 약 300 KB 아래로 떨어지는지로 합니다.

memo 경계나 비교 방식을 바꿔도 갱신 작업은 달라지지 않습니다. 갱신 중에 도는 F-D 코드가 없기 때문입니다. 줄일 수 있는 것은 마운트 때의 행당 보유량뿐입니다.

## 확인하지 못한 것

- V8 최적화 상태와 인라인 캐시는 추적하지 않았습니다. minor gc 대조에서 GC를 뺀 시간 차이가 [−11, +21] µs이므로, 영향은 약 20 µs 이하로 봅니다.
- 늘어난 생존 바이트 190 KB를 객체 종류별로 나누지 않았습니다.
- 창 안 GC 시간 차이(중앙값 −36 µs)가 전체 −44 µs를 다 설명하지는 않습니다. 나머지 약 −18 µs는 GC 직후의 캐시 효과로 추정하며, 잡음 범위 안입니다.
- 쓰기가 여러 번인 fixture에서 같은 효과가 있는지는 재지 않았습니다.
