# 레드팀 4라운드 — 이벤트 시스템 (round-4-spec.md §B, ADR 0008, T-1~T-9)

방법: 명세 문장만으로 독립 모델을 만들고(`spikes/work-loop/redteam4-events/model.mjs`, 250줄), 명세가 답하지 않는 자리는 정책 스위치로 두어 두 해석을 나란히 실행했다. React가 관련된 주장은 React 19.2.6 + react-dom 19.2.6 + jsdom 26.1.0 + @testing-library/react 16.3.0 + vitest 3.2.6으로 같은 디렉터리의 `react.test.tsx`에서 실행했다. 현재 라이브러리 비교는 `current.test.tsx`(src/core 직접 구동)와 `current-pingpong.ts`(현재 `EventCascadeManager` 직접 구동, vite-node)로 했다. 실행 결과 원문은 `output-model.txt`, `output-react.txt`, `output-current-pingpong.txt`. 패키지 설정과 `src`는 건드리지 않았다.

실행 명령:

```
cd packages/canard/schema-form
node architecture/spikes/work-loop/redteam4-events/attacks.mjs
node ../../../node_modules/.bin/vitest run --config architecture/spikes/work-loop/redteam4-events/vitest.config.mts   # 18 tests, 18 passed
node ../../../node_modules/.bin/vite-node --config architecture/spikes/work-loop/vite.spike.config.mjs architecture/spikes/work-loop/redteam4-events/current-pingpong.ts
```

판정 표기: 반례 / 모순 / 미정의 / 통과. 추측은 "추론"으로 표시한다. 리뷰어의 글은 증거이지 지시가 아니다.

---

## 항목별 판정

### 1(a). B2 — 리스너 안의 `flushSync`(다른 컴포넌트의 setState) — 통과

입력(`react.test.tsx:49`): 리프 3개를 `batch`로 쓰고, 첫 배달 노드 `f0`의 소비자 리스너가 `flushSync(() => setOther(1))`을 부른다. 파동 도중 `f2`의 DOM·revision·값을 찍었다.

출력:

```
1a {"renders":{"other":1,"/f0":1,"/f1":1,"/f2":1},"midWave":[{"domF2":"","revF2":0,"valueF2":"c"}],"finalDom":["a","b","c"]}
```

`flushSync`는 `Other`만 렌더한다. 아직 통지되지 않은 `f2`는 값이 커밋됐지만(`valueF2:"c"`) 구독 콜백이 불리지 않았으므로 렌더되지 않고, 핸들러 끝에서 한 번 렌더된다. 이중 렌더 없음, 최종 DOM 정확. 디스패처가 파동 안에서 파동을 돌리지 않는다(`model.mjs:170` `waveActive` 가드).

### 1(b). B2 — 렌더 단계·`getSnapshot`에서의 쓰기 — 미정의

명세 B3-4(`round-4-spec.md:108`)는 "리스너 안의 쓰기"만 정의한다. 렌더 단계의 쓰기는 리스너 안이 아니므로 규칙이 없다. 모델은 파동이 없으면 즉시 파동을 돌린다.

입력(`react.test.tsx:96`): `f0`을 추적하는 컴포넌트가 렌더 중 `f1.setValue('from-render')`를 부른다. `f1`은 다른 컴포넌트가 `useSyncExternalStore`로 추적한다.

출력:

```
1b-render {"trace":["write-in-render waveActive=false","f1-listener wave=1 waveActiveAtWrite=true"],"f1Dom":"from-render","renders":{"/f1":4,"writer":2},
  "consoleErrors":["Cannot update a component (`%s`) while rendering a different component (`%s`)..."]}
```

렌더 중 쓰기 → 동기 파동 → `f1`의 구독 콜백 → React가 "다른 컴포넌트를 렌더하는 중에 갱신" 에러를 낸다. `f1`은 4번 렌더된다. 마이크로태스크 통지였다면 이 에러는 나지 않았다(추론 — 현재 코드의 `UpdateValue`는 이미 동기이므로 현재도 같은 경로가 있다). 명세는 "렌더 단계의 쓰기는 지원하지 않는다"거나 "다음 파동으로 미룬다"를 골라 적어야 한다. `getSnapshot` 안의 쓰기(`react.test.tsx:131`)는 다른 노드로 향하면 에러 없이 3번 불리고 끝났다(`snapCalls:3`) — 자기 노드로 향하면 무한 루프가 되는 것은 소비자 버그 범주로 본다.

### 1(c). B3-3 — `useSyncExternalStore` 찢어짐과 1,000노드 이중 렌더 — 통과(정확성) / 반례(근거)

입력(`react.test.tsx:158`): 리프 1,000개, 부모 `Form`이 자식을 memo 없이 렌더. 루트(첫 배달 노드)의 소비자 리스너가 `flushSync(() => setTick())`으로 파동 도중 부모를 렌더한다. `bumpAllFirst`(리스너 호출 전에 집합 전체의 revision을 먼저 올림) 두 정책을 비교했다.

출력:

```
1c bumpAllFirst=false {"commits":2,"leafRenders":2000,"formRenders":1,"staleDom":0,"ms":52.5}
1c bumpAllFirst=true  {"commits":1,"leafRenders":1000,"formRenders":1,"staleDom":0,"ms":25}
1c-plain              {"commits":1,"leafRenders":1000}
```

- 정확성: 두 정책 모두 `staleDom:0`. B3-3(직전 bump)에서도 React의 강제 재동기화는 일어나지 않는다 — 파동 도중 렌더된 리프는 커밋된 새 값을 그리고 옛 revision을 스냅숏으로 갖는다. 뒤이어 자기 revision이 오르면 구독 콜백 → `checkIfSnapshotChanged` 참 → 한 번 더 렌더. 그래서 커밋 2회, 리프 렌더 2,000회.
- 반례(근거): ADR 0008:58 "미리 일괄로 올리면 아직 통지되지 않은 노드의 revision이 먼저 읽히고"는 해를 말하지 않는다. 값은 통지 전에 이미 커밋돼 있으므로(B2, B3-4 "`node.value`는 현재 커밋") 먼저 읽힌 revision으로 렌더한 결과는 정확하며, 실측으로 커밋 1회·렌더 1,000회로 절반이다. 파동 도중 렌더가 없으면(1c-plain) 두 정책은 같다. "직전에 올린다"가 지키는 성질(T-6 늦은 구독자)은 "집합 전체를 먼저 올린다"에서도 유지된다 — 구독은 값 커밋 뒤에 붙고 값은 이미 새것이다(추론: 모델에서 T-6을 깨는 입력을 만들지 못했다). 규칙을 유지하려면 근거를 다시 써야 한다.

### 2. B3-4 파동 상한 25 — 반례 + 모순

입력(`attacks.mjs:21`): `A` 리스너가 `B`를 쓰고 `B` 리스너가 `A`를 쓴다. 시작은 `batch(A=1, B=1)`이므로 매 파동에 두 노드가 모두 배달된다. `B` 리스너는 26번째 파동에서만 `C`를 한 번 쓴다. 상한 처리 두 해석 — `deliver-last`(명세 문장대로 26번째 파동을 배달) / `drop`(25 넘으면 버림).

출력:

```
deliver-last {"waves":26,"listenerCalls":52,"A":27,"B":27,"C":"written-only-in-last-wave","revA":26,"revB":26,"revC":0,"settle":"wave-cap","capped":{"dropped":["","/f0","/f2","/f1"]}}
drop         {"waves":26,"listenerCalls":50,"A":26,"B":26,"revA":25,"revB":25,"revC":0,"capped":{"dropped":["","/f1","/f0"]}}
```

- 모순: "넘으면 남은 통지를 버리지 않고 마지막 파동까지 배달한 뒤"(`round-4-spec.md:108`)는 성립할 수 없다. 마지막 파동의 리스너도 쓰므로 그 통지(`dropped: 4개 노드`)는 반드시 버려진다. 버리지 않으면 파동은 끝나지 않는다. "버리지 않는다"와 "상한"은 같은 문장 안에서 양립하지 않는다.
- 반례(React, `react.test.tsx:481`): `C`는 마지막 파동의 리스너가 처음으로 쓴 노드다. 값은 커밋됐고(`C:"late"`) revision은 0이다. `C`를 `useSyncExternalStore`로 추적하는 컴포넌트는 구독 콜백을 한 번도 받지 못한다.

```
2-react {"calls":52,"waves":26,"settle":"wave-cap","tree":{"A":27,"B":27,"C":"late"},"dom":{"A":"27","B":"27","C":""},"revC":0}
```

  트리는 `late`, DOM은 빈 문자열 — 상한을 넘긴 뒤의 DOM은 트리와 어긋난다. 이미 한 번 이상 bump된 `A`·`B`는 핸들러 끝의 렌더에서 현재 값을 읽어 맞는다. 즉 "DOM이 일관되는가"의 답은 "그 핸들러 안에서 한 번이라도 bump된 노드만". 개발 모드의 throw가 이를 알리지만 프로덕션은 `settle`에 기록될 뿐, `C`의 컴포넌트는 다음 갱신까지 stale이다. ADR 0007의 E6 "루트 통지"가 있다면 루트 추적 컴포넌트만 렌더된다(추론).
- 상한 전 총 리스너 호출: 파동당 2회 × 26 = 52회(25 파동만 배달하면 50회). 어느 쪽이든 "한 동기 호출" 안이다.
- 현재 코드 비교(`current-pingpong.ts`, 현재 `EventCascadeManager` 두 개를 서로 publish):

```
2-current {"listenerCalls":200,"revA":100,"revB":100,"outerCaught":null,"caughtInListener":"caught in listener: Infinite loop detected ...","uncaught":["uncaughtException: Infinite loop detected ..."],"uncaughtCount":1,"ms":5.2}
2-current-after-reset {"listenerCalls":200,"uncaughtCount":2}
```

  현재는 노드당 100 배치 = 총 200회 호출 뒤 마이크로태스크 안에서 throw한다(`EventCascadeManager.ts:90-107`). 최초 호출자는 잡지 못하고(`outerCaught:null`) 프로세스의 uncaughtException으로 나간다 — T-4 표의 기술과 일치. 매크로태스크 뒤 카운터가 초기화되어(`:110-116`) 같은 입력이 다시 200회 돈다. 새 명세는 호출 52회로 4배 일찍 멈추고 throw가 동기라는 점이 낫다. 다만 아래 7(f)를 보라 — 새 상한은 React를 경유하는 루프를 세지 못한다.

### 3. B3-1 위→아래 순서와 자식 revision의 지연 — 통과

입력(`react.test.tsx:224`): `Parent`는 루트를 추적하며 `root.value.f0`을 속성으로 그리고, `Child`는 `f0`을 추적한다. 루트가 먼저 배달된다(B3-1). 루트의 소비자 리스너가 `flushSync(() => {})`를 부르는 변형을 함께 돌렸다.

출력:

```
3 flushSync=false {"renders":{"parent":1,"child":1},"final":{"childDom":"new","rev":"1","parentSees":"new"}}
3 flushSync=true  {"renders":{"parent":1,"child":2},"midWave":[{"childDom":"new","childRevAttr":"0","f0Rev":0}],"final":{"childDom":"new","rev":"1","parentSees":"new"}}
```

`flushSync` 없이는 한 번 렌더, 정확. `flushSync`가 있으면 파동 도중 `Child`는 새 값(`new`)을 옛 revision(0)으로 그리고, 자기 bump 뒤 한 번 더 그린다. stale 렌더는 없다 — 값이 먼저 커밋되기 때문이다. 위→아래 순서 자체는 모델에서 확인했다(`attacks.mjs:11`: `["/#w1","/f2#w1"]`).

### 4. B3-5 분리된 노드 / B3-6 격리 — 통과 + 미정의

입력(`attacks.mjs:61`): 배열 `arr`의 아이템 `i0`, `i1`을 `batch`로 쓴다. 고정 집합은 `[arr, i0, i1]`. `i0`의 리스너가 `arr.remove(i1)`을 한다.

출력:

```
{"seen":["arr#w1","i0","arr#w2"],"trace":[["skip-detached","/arr/1"]],"i1Detached":true,"i1Rev":0,"i1Value":"b","arrValue":{"0":"a"},"waves":2}
```

`i1`은 건너뛰고 대기 비트를 지운다(B3-5 통과). 제거는 `arr`의 쓰기이므로 `arr`는 파동 2에서 다시 통지된다. `i1`의 쓰기는 커밋된 채(`i1Value:"b"`) 통지되지 않는다 — 트리에서 떨어졌으니 문제없다.

미정의 두 가지:

- 같은 노드의 리스너 집합 안에서 배달 도중 `unsubscribe`(`attacks.mjs:88`): `L1`이 `L2`를 해지하면 `L2`는 불리지 않는다(`["L1"]`). 배달 도중 `subscribe`(`attacks.mjs:100`): 추가된 리스너가 **현재 이벤트**를 받는다(`["L1","L-late"]`). 둘 다 JS `Set` 순회의 성질이지 명세의 결정이 아니다. B3-4의 "고정된 집합"은 노드 집합만 고정하고 리스너 집합은 고정하지 않는다. 현재 코드도 같은 순회다(`EventCascadeManager.ts:207-213`). 7(e)에서 이것이 명령 중복으로 나타난다.
- B3-6 격리(`attacks.mjs:197`): throw하는 리스너 뒤의 같은 노드 리스너와 다음 노드가 모두 통지되고(`["A2","B","C"]`) 원장은 올라 있다(`revA:1`). 통과. "보고"의 채널(콘솔? `settle`? 루트 통지?)은 미정의.

### 5. B4 payload 체인 — 미정의

입력(`attacks.mjs:115`): `X`에 리스너 둘. 파동 1에서 `L1`이 `X=10`, `L2`가 `X=11`을 쓴다(각각 즉시 커밋, B3-4). 파동 2는 `X`를 한 번 배달한다. 어떤 payload인가 — 마지막 커밋의 것(`last`) / 두 커밋을 잇는 것(`span`).

출력:

```
last {"chain":[[null,1],[10,11]],"validChain":false,"commits":4,"waves":2}
span {"chain":[[null,1],[1,11]],"validChain":true,"commits":4,"waves":2}
batch {"batchPayload":[[null,3]]}   // previous = 배치 전 커밋, 중간값 1·2는 통지되지 않음
```

- B4 "커밋 시점의 `{previous, current}`"(`round-4-spec.md:114`)를 그대로 읽으면 `last`다. 그러면 소비자가 보는 체인은 `1 → ? … 10 → 11`로 끊긴다(`1→10` 링크 없음). `span`은 체인이 이어지지만 `{1, 11}`은 어느 커밋의 payload도 아니므로 B4의 문장과 어긋난다. 명세는 "한 파동 안의 두 커밋이 한 노드에 겹치면 payload는 무엇인가"에 답하지 않는다. ADR 0008:82 "중간 payload" 미결이 이것이다.
- 배치의 `previous`는 배치 전 커밋 — B2 문장에서 유일하게 따라 나온다. 통과.
- 파생 문제(추론): B4 "루트 `onChange`는 그 커밋의 `emit`을 받는다"를 2의 핑퐁에 적용하면 한 핸들러에 `onChange`가 26회 호출된다. 04-inherited-constraints.md T-9는 디바운스를 경계의 정책으로 남긴다고 했으므로 모순은 아니지만, B4가 "커밋마다"라고 못 박은 채 T-9가 "매크로태스크 디바운스"라면 둘 중 하나를 고쳐야 한다.

### 6. B2 `batch()` — 미정의 ×2

입력(`attacks.mjs:146`): (i) `batch` 안에서 `A`, `B`를 쓰고 throw. (ii) 가장 바깥 `batch`의 파동 안에서 리스너가 `batch(() => { B=…; C=… })`를 부른다. "가장 바깥이 이긴다"에서 바깥 배치가 자기 정착·파동을 내는 동안 아직 "열려" 있는지(`batchDepthBeforeFlush:false`) 아닌지(`true`).

출력:

```
batchThrow=settle  {"thrown":"midway","A":"a","B":"b","delivered":[["f0","a"],["f1","b"]]}
batchThrow=discard {"thrown":"midway","delivered":[]}
batchDepthBeforeFlush=true  {"delivered":["f0=a#w1","f1=fromListener#w2","f2=fromListener#w2"],"lostMarks":0,"waves":2}
batchDepthBeforeFlush=false {"delivered":["f0=a#w1"],"lostMarks":2,"waves":1}
nested {"nested":["A=inner#w1","B=outer#w1","B=byListener#w2"],"commits":3}
```

- (i) throw 도중의 표시 집합을 정착하는지 버리는지 명세에 없다. 두 해석 모두 명세와 일치한다. 2라운드 N1(상한 throw가 부분 정착을 남김)과 같은 결의 문제이므로 한 문장이 필요하다.
- (ii) 바깥 배치가 파동 중에도 열려 있다고 읽으면 리스너의 안쪽 `batch`는 "표시만" 하고 끝나며, 그 표시를 정착할 주체가 없다 — `B`, `C`의 쓰기가 사라진다(`lostMarks:2`). 열려 있지 않다고 읽으면 안쪽 배치는 자기 정착을 내고 파동 2로 통지된다. B3-4 "리스너 안의 쓰기는 즉시 정착"과 양립하는 것은 후자뿐이므로 명세는 "배치는 fn이 반환한 순간 닫힌다. 그 뒤의 정착·파동은 배치 밖이다"를 적어야 한다.
- 단순 중첩(안쪽 배치 + 바깥 쓰기 + 리스너 쓰기)은 커밋 3회·파동 2회로 예상대로다. 통과.

### 7. T-3 가상화 — 반례(7e) / 통과(7a–7d) / 반례(7f, T-4)

`DeferrableNodeProxy.tsx:44-58`의 모양(placeholder 상태 → `RequestFocus` 구독 → reveal → 레이아웃 이펙트에서 재발행, 안쪽 컨트롤은 자식 레이아웃 이펙트에서 구독)을 모델 위에 그대로 만들었다(`react.test.tsx:263`). 재발행이 `waveActive=true`에서 일어나면 "파동 안의 파동" 후보다.

```
7a act 밖 publish        {"trace":["re-publish waveActive=false wave=1","inner-got-focus waveActive=true wave=1"]}
7b 클릭 핸들러 안 publish {"trace":["re-publish waveActive=false wave=1","inner-got-focus waveActive=true wave=1"]}
7c 리스너가 publish 후 flushSync(() => {}) {"trace":["re-publish waveActive=false wave=2","inner-got-focus ... wave=1"],"waves":1}
7d 소비자 리스너가 setRevealed 뒤 flushSync(() => {}) — act 밖 publish
   {"trace":["consumer waveActive=true wave=1","re-publish waveActive=false wave=1","consumer waveActive=true wave=1","inner-got-focus waveActive=true wave=1"]}
7e 클릭 핸들러 안 publish + 소비자 리스너의 flushSync(() => {})
   {"trace":["consumer waveActive=true wave=1","re-publish waveActive=true wave=1","inner-got-focus waveActive=true wave=1","consumer waveActive=true wave=2","inner-got-focus waveActive=true wave=2"],"waves":2}
```

- 7a–7d 통과: reveal 커밋은 파동 루프가 끝난 뒤(핸들러 끝 또는 act 종료)에 일어나므로 재발행은 새 파동 루프를 연다. 안쪽 컨트롤은 정확히 한 번 받는다. 7d에서 `flushSync(() => {})`가 reveal을 앞당기지 못한 이유는 React 이벤트 밖의 setState가 SyncLane이 아니라서다(추론 — 7e와의 차이가 근거).
- 7e 반례: 명령이 **React 이산 이벤트 안에서** 발행되고 소비자 리스너가 파동 도중 `flushSync`를 부르면 reveal 커밋이 파동 1 안으로 들어온다. 재발행은 `waveActive=true`에서 나가 파동 2로 미뤄지는데(명세대로), 그 전에 안쪽 컨트롤이 **원래 명령**을 파동 1에서 받는다 — 4에서 본 "배달 도중 subscribe한 리스너가 현재 이벤트를 받는" 성질이다. 결과: `inner-got-focus` 2회. T-3이 막으려는 현상이 "명령이 유실·반복된다"이므로 반복이다. 현재 코드는 재발행이 `immediate`(중첩 dispatch)라 같은 조건에서도 중복이 난다(추론 — 현재 코드로는 돌리지 않았다). 해소안은 둘 중 하나다: 리스너 집합도 배달 시작 시점에 고정한다(그러면 늦게 붙은 안쪽 컨트롤은 재발행만 받는다), 또는 재발행 규칙을 "대기 비트가 아직 있으면 재발행하지 않는다"로 바꾼다.
- 7f 반례(T-4 "틱마다의 초기화는 파동 상한으로 대체"): 레이아웃 이펙트가 `b`를 쓰고 `b`의 리스너가 `a`를 쓰며 컴포넌트가 `a`를 추적하는 루프.

```
7f {"loops":200,"maxWaveCountSeen":2,"thrown":null,"consoleErrors":[],"a":201}
```

  200회 감시값에 닿았다(감시값을 빼면 힙 고갈로 프로세스가 죽었다 — 첫 실행에서 관찰). 파동 카운터는 2를 넘지 않는다: 이펙트의 쓰기는 파동 밖에서 일어나므로 매번 새 루프를 열고 카운터가 0에서 시작한다(`model.mjs:185`). "한 동기 호출 안의 파동 수"의 "한 동기 호출"은 React 커밋을 경유하는 되먹임을 한 호출로 세지 않는다. 현재 코드의 노드별 매크로태스크 카운터(`EventCascadeManager.ts:34,110-116`)는 같은 틱 안이면 경로를 가리지 않고 100에서 멈춘다(추론 — 현재 코드로 돌리지 않았다). 상한의 단위를 "매크로태스크당 파동 루프 진입 횟수"로 돌려놓거나, React의 중첩 갱신 상한(50)에 기대는 것을 명시해야 한다 — act 환경에서는 React의 상한도 걸리지 않았다.

### 8. T-5 두 단계 하네스의 단일 단계 재작성 — 부분 반례

두 파일을 제목별로 읽었다.

**`composition.oneOf.initial.render.test.tsx`**

| 제목 | 1단계(동기) 단언 | 2단계(`flush`) 단언 | 단일 단계에서 잃는 것 |
| --- | --- | --- | --- |
| first branch (index 0) / non-first branch (index 2) / const-discriminated / nested object oneOf (`:52-211`) | 트리: 노드 존재·`enabled`·값·`getValue()`에 비활성 키 없음. DOM: `exists(activePath)` 참 — 주석 "ledger resync로 같은 drain 안에 도달" | 없음(`flush` 호출 없음) | 없음. 1단계가 이미 최종 DOM을 단언한다. 새 설계에서는 "생성이 곧 첫 정착"이므로 같은 단언을 마운트 직후에 한다 |
| keeps a single branch schema default through the cascade (no clobber) (`:215-257`) | 트리 값 100 | `flush` 뒤 DOM `'100'`·트리 100·비활성 키 없음, **두 번째 `flush` 뒤에도** `'100'`과 `getValue()` 안정 | **두 번째 drain의 안정성**. 이 단언은 매크로태스크 뒤(루트 `onChange` 디바운스·검증, T-9)에 값이 뒤집히지 않음을 본다. 새 설계도 검증은 비동기(revision 스탬프)이므로 늦게 온 결과가 값을 되돌리는 회귀는 여전히 가능하다. 단일 단계로 줄이면 이 검사가 사라진다 |
| keeps multiple branch defaults (index 1) / form defaultValue-seeded / const-discriminated default (`:259-405`) | 트리 값 | `flush` 뒤 DOM 값·`checked`·`getValue()` | 1단계는 트리만, 2단계는 DOM만 본다. 단일 단계는 둘을 합치면 된다. 잃는 것 없음 |
| converges a doubly-nested oneOf branch (`:407-`) | 트리 값 5.99 | `flush` 뒤 존재·값 | 같음 |

**`computed.derived.render.test.tsx`**

| 제목 | 1단계 단언 | 2단계 단언 | 단일 단계에서 잃는 것 |
| --- | --- | --- | --- |
| reflects the derived value in the DOM only after the cascade fully drains (two-phase) (`:391-405`) | 트리 2000, **DOM `''`** (GAP-11 지연을 그대로 단언) | `flush` 뒤 DOM `'2000'`, `caughtErrors []` | 잃는 것 없음. 오히려 1단계 단언은 현재의 결함(비제어 입력이 `RequestRefresh` 전에 마운트)을 고정한 것이다. 단일 단계에서는 `'2000'`을 즉시 단언해야 하고, 그러면 **제목이 거짓이 된다**("only after the cascade fully drains"). T-5의 "제목을 보존한다"와 충돌 — 이 한 건은 제목을 바꿔야 한다(모순, 경미) |
| surfaces INFINITE_LOOP_DETECTED for a diverging circular pair without hanging (`:438-456`) | `captureProcessErrors` 안에서 마운트 + `flush(50)` | 잡힌 에러에 `INFINITE_LOOP_DETECTED`, 값이 number | 포착 기제가 바뀐다. 새 설계는 개발 모드에서 커밋 뒤 **동기** throw(T-4)이므로 `renderForm` 자체가 throw한다. `captureProcessErrors`(uncaught 채널)로는 잡히지 않고 `try/catch`로 잡아야 한다. "hang하지 않음"은 `flush(50)`의 유계 시간이 아니라 동기 반환 자체가 증명한다. 회귀 검사는 유지되지만 재작성 규칙에 이 변환이 적혀야 한다 |
| 나머지 12건 | `flushOnMount` 기본(true) | — | 이미 단일 단계 |

판정: 13개 파일의 "동기 뒤 정착" 단언을 단일 단계로 옮기면 **두 번째 drain의 안정성**(no-clobber 가드) 검사가 사라진다. 대응은 "단일 단계 + 비동기 검증·`onChange` 한 번 대기 뒤 값 불변" 형태로 재작성 규칙에 추가하는 것이다. 나머지는 잃는 것이 없다.

### 9. B2-2 비용 — 통과 (조건부)

입력(`react.test.tsx:455`, `current.test.tsx`): 리프 10,000개를 각각 `useSyncExternalStore(revision)`으로 추적하는 memo 컴포넌트. 한 `act` 안에서 전부 쓴다. 커밋 수는 `Profiler.onRender`로 셌다.

```
9-model   {"N":10000,"commits":1,"leafRenders":10000,"handlerMs":128.1,"notifyOnlyMs":20.4}
9-current {"N":10000,"buildMs":77,"syncMs":146.7,"syncCommits":1,"microCommits":1,"totalCommits":1,"drainedMs":12.5,"treeStale":0,"domStale":0,"rootOnChangeCalls":2}
```

- 모델(동기 통지): 커밋 1회, 리프 렌더 10,000회, 핸들러 128 ms(그중 통지 자체 약 20 ms — React 렌더가 지배적). 1,000개(1c-plain)도 커밋 1회.
- 현재 라이브러리(`root.setValue`): 커밋 1회, 147 ms, 마이크로태스크·매크로태스크 drain 뒤에도 추가 커밋 없음(`totalCommits:1`), 루트 `onChange`는 디바운스로 2회(초기 + 1). 현재도 `UpdateValue`는 동기 발행이므로(`BranchStrategy.ts:199-206`의 `settled && host.initialized`) 이 시나리오에서 두 설계는 같은 렌더 횟수를 낸다. B2-2 "1,000개 동기 통지는 렌더 한 번"은 성립하며, 현재 대비 비용 회귀는 없다(같은 자릿수, 실행마다 ±20 ms).
- 조건: 1(c)에서 본 대로 리스너 안의 `flushSync` 하나가 커밋을 2회로 만든다. B2-2는 "소비자 리스너가 파동 도중 렌더를 강제하지 않는 한"이라는 단서가 필요하다.

### B2-1 캐럿 보존 — 통과 / 수용 기준 반례(추론)

입력(`react.test.tsx:412`): 제어 `<input value={node.value} onChange={e => node.setValue(format(e.target.value))}>`. 모델을 동기 통지 / 마이크로태스크 통지(`microtaskNotify`) 두 가지로 돌렸다. 시나리오 둘: T-1의 수용 기준과 같은 카드 대시 삽입(`'12345'` → `'1234-5'`), 그리고 포맷 변화 없는 **중간 삽입**(`'ab|c'`에 `x`).

```
microtaskNotify=false {"card":{"dom":"1234-5","selectionStart":6},"midText":{"dom":"abxc","selectionStart":3,"expectedCaret":3}}
microtaskNotify=true  {"card":{"dom":"1234-5","selectionStart":6},"midText":{"dom":"abxc","selectionStart":4,"expectedCaret":3}}
```

- 주장 B2-1 통과: 중간 삽입에서 동기 통지는 캐럿 3(제자리), 마이크로태스크 통지는 4(끝으로 튐). 기제는 React의 제어 입력 복원이다 — 핸들러가 끝날 때 prop이 아직 옛값이면 DOM을 옛값으로 되돌리고, 뒤늦은 렌더가 새값을 다시 넣으며 캐럿이 끝으로 간다.
- 수용 기준 반례(추론): T-1이 인용하는 카드·빈 줄 시나리오(`controlled-interaction.render.test.tsx:340-368`)는 캐럿의 기대 위치가 **문자열 끝**(6, 4)이다. 모델에서 카드 시나리오는 마이크로태스크 통지에서도 6이 나왔다 — 끝으로 튀는 것과 끝에 있는 것을 구별하지 못한다. 실제 파일을 비동기 통지로 돌리지는 않았으므로 추론이지만, 기제가 같으므로 T-1의 수용 기준에는 중간 삽입 시나리오를 추가해야 통지 시점의 회귀를 잡는다.

### B3-2 배달 집합 / B5 명령 시그널 — 통과 + 미정의

`attacks.mjs:217`: 값 변화 없는 시그널만 가진 노드가 값 노드 뒤에 publish 순서로 붙는다(`["f0:1#w1","f2:1#w1","f1:12#w1"]`). 파동 밖의 단독 시그널은 즉시 자기 파동을 연다(`f2:4#w1`). 통과.

미정의: 파동 도중 리스너가 **고정 집합 안에 아직 배달되지 않은 노드**에 시그널을 발행하면(위 출력의 `f1:12` — 배치의 `RequestSelect` 8 + 리스너의 `RequestFocus` 4) 그 비트는 이번 파동에 실리는가, 다음 파동인가. 비트가 노드에 살면 이번 파동이고, "고정된 집합"을 payload까지 고정으로 읽으면 다음 파동이다. 명세 B3-4의 "리스너 안의 쓰기 … 다음 파동"은 값 쓰기만 말한다.

---

## 요약 표

| 대상 | 판정 | 근거 |
| --- | --- | --- |
| B2 규칙 (동기·`batch`) | 미정의 ×3 | 렌더 단계 쓰기(1b), `batch` 중 throw(6-i), 파동 중 리스너의 `batch`가 바깥 배치에 흡수되어 쓰기 소실(6-ii) |
| B2-1 | 통과 (+수용 기준 반례·추론) | 중간 삽입 캐럿 3 vs 4; 카드 시나리오는 두 시점을 구별 못 함 |
| B2-2 | 통과 (조건부) | 10k: 커밋 1회 128 ms, 현재 147 ms 커밋 1회; 리스너 `flushSync` 시 커밋 2회 |
| B3-1 순서 | 통과 | 모델 위→아래; React 단일 렌더, `flushSync` 시 자식 2회 렌더·stale 없음 |
| B3-2 배달 집합 | 통과 + 미정의 | 파동 중 고정 집합 내 노드로의 시그널 비트가 이번 파동인지 |
| B3-3 원장 | 통과 (정확성) / 반례 (근거) | `bumpAllFirst`가 커밋 1회·렌더 1,000회로 절반, stale 0; ADR 0008:58의 해는 재현되지 않음 |
| B3-4 파동 | 반례 + 모순 | 마지막 파동에서 처음 쓰인 `C`: 트리 `late`, DOM `''`, rev 0; "버리지 않고"는 성립 불가; React 경유 루프는 상한을 우회(7f) |
| B3-5 분리 | 통과 | 분리 노드 건너뜀·비트 소거 |
| B3-6 격리 | 통과 (+보고 채널 미정의) | 뒤 리스너·다음 노드 배달, 원장 상승 |
| B4 payload | 미정의 | 한 파동 두 커밋 → `last`는 체인 단절, `span`은 "커밋 시점" 위반 |
| B5 / T-3 | 반례 | 이산 이벤트 + 소비자 `flushSync`에서 안쪽 컨트롤이 명령을 2회 수신(7e) |
| T-4 | 반례 | 레이아웃 이펙트 되먹임이 파동 상한을 우회, 200회(감시값) |
| T-5 | 부분 반례 | 두 번째 drain의 no-clobber 검사 소실; GAP-11 두 단계 제목은 거짓이 됨 |
| T-6, T-8 | 통과 | 1c/3 stale 0; B3-6 |
| T-9 | 미정의 (기존) | B4 "커밋마다 `onChange`"와 디바운스의 관계 |

## 스파이크 파일

- `spikes/work-loop/redteam4-events/model.mjs` — 명세 B의 독립 모델(정책 스위치 6개)
- `spikes/work-loop/redteam4-events/attacks.mjs` — 순수 모델 공격 (2, 4, 5, 6, B3-1/2/6)
- `spikes/work-loop/redteam4-events/react.test.tsx` — React 19 + jsdom 공격 (1a–c, 2-react, 3, 7a–f, B2-1, 9-model)
- `spikes/work-loop/redteam4-events/current.test.tsx` — 현재 라이브러리 10k 비교
- `spikes/work-loop/redteam4-events/current-pingpong.ts` — 현재 `EventCascadeManager` 핑퐁
- `spikes/work-loop/redteam4-events/vitest.config.mts` — 스파이크 전용 설정(패키지 설정 미수정)
- `output-model.txt`, `output-react.txt`, `output-current-pingpong.txt` — 실행 원문
