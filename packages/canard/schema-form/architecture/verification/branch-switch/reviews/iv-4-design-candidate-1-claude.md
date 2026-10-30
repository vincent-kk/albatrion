# Ⅳ-4 설계 커밋 검토 판정 (`c5cb20f87..2a895fae7`)

경로는 모두 `packages/canard/schema-form/` 기준입니다.

## 판정

**조건부 통과입니다.** P1은 0건, P2는 5건, P3는 9건입니다. 커밋은 `architecture/plan/branch-switch/design-iv.md` 끝에 57줄만 덧붙였고 기존 문장은 하나도 바뀌지 않았습니다. 소유자 인용은 브리프와 글자 단위로 일치합니다(117자). 추가된 줄에는 기계 로컬 경로와 소유자 실명이 없습니다. 판정 규칙은 브리프와 `verification.md`에 맞게 적혔습니다. 그 규칙은 후보당 커밋 하나, 세 A 반복의 최대 산포를 잡음으로 쓰는 탐침 관문, 의미 동일, 승인 없는 상주 구조 금지, 묶음당 창 하나, 가중 교환비 < 0, 폭 밖 퇴보 0입니다. Ⅳ-3-0·B2-P1b·B2-P3·Ⅳ-1·미시 위생에서 인용한 수치는 모두 원 문서와 일치합니다. 두 코드 주장(S4의 등록 생존 가설 반증, S6a의 지연 계약)도 코드로 확인했습니다. 그러나 원시 프로파일의 호출자를 세어 보니 S1의 표적 행과 S3a의 대상 호출자가 틀렸습니다. S9의 할당 진단 방법은 GC를 일으키는 단명 객체를 보지 못합니다. 아래 P2 다섯 건을 고친 뒤 Phase 2를 시작해야 합니다.

검증 범위는 diff 전체, 브리프, Ⅳ-3-0 결과 문서, 원시 `tables.json`·`cpu.cpuprofile.gz`(호출자와 줄 표본 계수), 다섯 결과 문서의 해당 부분, 제품 코드의 해당 함수입니다. 빌드와 장시간 시험은 실행하지 않았습니다.

## P1

없습니다.

## P2

### P2-1. S1의 표적 행에 oneOf-80이 있지만, oneOf-80의 `hasOwnProperty` 비용은 S1이 바꾸는 두 호출자에서 오지 않습니다 (확인됨)

근거: `architecture/verification/branch-switch/raw/iv-3-0/switch-oneOf-80-50/cpu.cpuprofile.gz`에서 `hasOwnProperty` 표본의 부모 함수를 세면 313개 중 `dirtyChildren` 147, `registerPresenceChanges` 54, `selectEntryStep` 44, `collectPresenceChangeNames` 30, `readSlotExitPolicy` 17, `assembleObject` 13입니다. `flushRead`와 `readProjectedValue`는 상위에 없습니다. siblings-0에서는 450개 중 `flushRead` 257(57%), `readProjectedValue` 146(32%), `dirtyChildren` 33입니다. 설계 Phase 2의 3번은 "각 표적 행이 A−B > nᵣ"일 때만 커밋을 유지합니다. 또 `flushRead`(`src/core/engine/settle/utils/gates/flushPendingGateReads.ts:119-124`)의 검사 뒤에는 합칠 값 조회가 없어서, "조회와 중복 own-key 검사를 합친다"는 형태가 그 지점에 적용되지 않습니다. `structure`는 대부분 null-prototype 사전이지만 배열 호스트에서는 배열입니다(`applyArrayTail.ts:151`, `applyArraySplice.ts:134`, `applyArraySlots.ts:217`).

실패 시나리오: S1을 정확히 구현해 siblings-0이 줄어도, oneOf-80 표적 조건을 못 채워 되돌려집니다. 그러면 결과 문서에 "절감 없음"으로 잘못 기록됩니다.

수정 명세: S1 행의 "겨냥하는 행"을 `siblings-0`으로 바꾸고 oneOf-80은 보호 행으로 옮깁니다. "이전 관측" 칸에는 siblings-0의 호출자 몫(`flushRead` 57%, `readProjectedValue` 32%)을 적습니다. 또 oneOf-80의 1.111 µs가 다른 호출자 몫이라는 문장을 넣습니다. 좁힌 형태는 두 지점으로 나눠 적습니다. `readProjectedValue.ts:61-64`는 null-prototype 사전일 때 조회 하나로 합칩니다. `flushRead`는 null-prototype 사전이고 어떤 자체 키도 `undefined` 값을 갖지 않음이 증명될 때만 `=== undefined` 비교로 바꿉니다. 배열 `structure`에서는 두 곳 모두 기존 helper를 유지합니다. 확인 방법: 수정된 행의 표적 열에 oneOf-80이 없어야 합니다. 또 `structure` 작성 지점 13곳의 prototype 분류가 행이나 구현 계획에 열거되어야 합니다.

### P2-2. S3a의 대상 호출자가 틀렸고, 그 비용의 대부분은 S5가 겨냥하는 나감 경로 비용과 같습니다 (확인됨)

근거: oneOf-80에서 `getHostDerived` 표본 670개 중 521개(78%)의 부모가 `readFieldNodeWatchValues`입니다. 또 `readFieldNodeWatchValues` 385개 중 382개의 부모가 `captureDetachedFieldNodeReads`입니다. 나머지는 `prepareControlLayers` 44, `prepareStaticHost` 19, `ensureEffectiveSchemaCache` 15, `getSlotChildIndex` 15입니다. 따라서 S3a가 지목한 `mergeEffectiveSchema`와 read-plan builder는 많아야 약 15%입니다. `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:55-57`은 watch 목록이 비어도 `getHostDerived`를 부르고 witness를 씁니다(:90-103). 또 빈 배열을 만들고(:69) memo를 삽입합니다(:106-110). S5의 좁힌 형태가 바로 이 부기를 없앱니다.

실패 시나리오: S3a를 먼저 구현하면 대상 비용의 약 15%만 건드려 탐침에서 떨어집니다. S5를 먼저 구현하면 S3a가 인용한 수치의 대부분이 이미 사라져, 두 행이 같은 비용을 주장하게 됩니다.

수정 명세: S3a 행을 "S5 뒤에 남은 비-나감 호출자(`prepareControlLayers`·`prepareStaticHost`·`ensureEffectiveSchemaCache`·`getSlotChildIndex`, 합계 약 14%, 상한 약 0.35 µs/왕복)"로 다시 쓰고 S5 다음 순서로 둡니다. 이 상한은 oneOf-80 탐침 잡음보다 작을 가능성이 높으므로 "보류"로 표시합니다. S5 행의 이전 관측 칸에는 `getHostDerived` 중 나감 몫(약 1.9 µs/왕복)을 기대 절감의 일부로 적습니다. 또 두 행이 같은 µs를 중복 주장하지 않는다는 문장을 넣습니다. 확인 방법: 두 행의 기대 비용 합이 `getHostDerived` 2.474 µs를 넘지 않아야 합니다.

### P2-3. S9의 `--heap-prof`는 GC에 회수된 단명 객체의 표본을 버리므로 GC 14.39 µs의 할당 주인을 찾지 못합니다 (확인됨, Node 24.20 기준)

근거: 로컬 실험에서 약 96 MB의 단명 객체를 할당하는 반복문을 `--heap-prof`로 재면, 표본 합계가 3.32 MB로 반복문이 없는 기준 3.03 MB와 거의 같았습니다. 같은 반복문을 inspector의 `HeapProfiler.startSampling`으로 재면, 기본 옵션은 1,056 바이트였습니다. `includeObjectsCollectedByMajorGC: true`와 `includeObjectsCollectedByMinorGC: true`를 주면 192,475,768 바이트였습니다. 즉 기본 표본은 종료 시점에 살아 있는 객체만 남깁니다.

실패 시나리오: S9가 생존 객체(청사진과 캐시)를 상위 할당 프레임으로 보고합니다. 그러면 그 결과로 추가되는 새 후보가 GC 비용과 무관한 곳을 겨냥합니다.

수정 명세: S9 행의 방법을 다음으로 바꿉니다. plain worker 안에서 `node:inspector` Session을 열고, 예열 뒤 `HeapProfiler.startSampling({ samplingInterval, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true })`를 시작하고, 20,000 동작 직후 `stopSampling`합니다. `--heap-prof`는 생존 객체 보조 진단으로만 남기고, `--trace-gc`는 횟수와 종류 집계에만 씁니다. 확인 방법: 진단 원시에 두 옵션 값이 기록되어야 합니다. 또 표본 바이트 합이 "동작 수 × 왕복당 할당량" 규모와 맞는지 한 문장으로 대조합니다. Node 26.12.1의 기본값이 같은지는 확인하지 못했습니다.

### P2-4. 새 절이 옛 Ⅳ-4의 이정표 재측정과 소유자의 도달선 판정을 "대체한다"고 적어, 브리프에 없는 범위 결정을 했습니다 (확인됨)

근거: `design-iv.md:298`은 "이 단계는 위 표의 옛 Ⅳ-4 이정표 재측정을 대체한다"고 적습니다. 그런데 `design-iv.md:84`의 소유자 채택 문장은 "Ⅳ-4에서 그 선에 닿았는지로 마감을 판정한다"고 정합니다. `:78`·`:125`·`:245`도 Ⅳ-4를 세 레인 22행 이정표 재측정과 소유자의 도달선 판정으로 둡니다. 브리프는 이 단계의 묶음 창 하나만 정하고, 이정표 재측정의 폐지나 이동은 말하지 않습니다. 브리프의 표준 답은 "브리프 밖 결정은 `question`"입니다.

실패 시나리오: 이 문장이 승인되면 설계 Ⅳ의 마감 판정이 계획에서 사라집니다. 그 판정은 0.16.1 레인 대비 비율과 이론상 바닥 도달 여부입니다.

수정 명세: 그 한 문장을 다음으로 바꿉니다. "옛 Ⅳ-4의 이정표 재측정(세 레인, 22행)과 소유자의 도달선 판정은 이 묶음 뒤 별도 단계로 미루며, 번호와 시점은 조정자가 정한다." 아니면 조정자에게 `question`으로 묻습니다. 새 절 밖의 문장은 바꾸지 않습니다. 확인 방법: diff가 여전히 끝부분 추가만 포함해야 합니다.

### P2-5. S7은 작은 절감이 아니고, 과거 실패 행이 탐침에 보이지 않아 묶음 창 하나를 위험하게 합니다 (확인됨)

근거: 설계 Phase 2의 2번은 nested 행에만 Ⅳ-1 어댑터를 연결한다고 적습니다. 그 어댑터는 `single-nested-d6-f4`와 `switch-nested-oneOf-20`만 지원합니다(`architecture/verification/branch-switch/tools/iv-1/rows.mjs:4-11`, `tools/iv-1/operation.mjs:11`). Ⅳ-1 창 2의 실패는 leaf-gate-4000(+26.938 µs, 폭 26.501), leaf-gate-8000(+61.667 µs, 폭 15.666), Bun 힙(A 최대 2,248.588 대 B 중앙 2,250.419 B/node)이었습니다(`iv-1-results.md:90-91,96,111`). plain Node 탐침은 이 셋을 재지 않습니다. 또 Ⅳ-1의 leaf-gate 퇴보 원인은 확정되지 않았습니다(`iv-1-results.md:129`). 따라서 전 경로 Map을 없애도 퇴보가 사라진다는 보장이 없습니다. 행에는 서술자의 저장 위치와 생성 시점도 없습니다. 첫 쓰기에서 만든다면 `verification.md:81`의 첫 쓰기 추가항이 적용됩니다.

실패 시나리오: S7이 탐침을 통과해 묶음에 들어간 뒤, 본 창에서 leaf-gate 행이 폭 밖으로 퇴보합니다. 그러면 묶음 전체가 이등분과 두 번째 창 승인을 기다리게 됩니다.

수정 명세: S7 행의 추천을 "이번 묶음에서 보류"로 바꾸고 이유 세 가지를 적습니다. 첫째, 탐침이 leaf-gate 행과 Bun 힙을 보지 못합니다. 둘째, 퇴보 원인이 확정되지 않았습니다. 셋째, 국소 바퀴의 재구현이라 커밋 하나 규모가 아닙니다. 조정자가 그래도 진행을 원하면 유지 조건에 두 가지를 더합니다. 하나는 leaf-gate-4000/8000 탐침 어댑터이고, 다른 하나는 Node/Bun 힙 7표본 확인입니다. 또 서술자를 `getBlueprintDerived(blueprint)`의 슬롯 하나에 두고, 생성 시점(청사진 작성 또는 첫 쓰기)을 적습니다.

## P3

P3-1. S3b의 빠른 경로가 뜨거운 호출에 걸리지 않을 수 있습니다 (그럴듯함). `selectEffectiveDeclarations` 표본 506개는 모두 `mergeEffectiveSchema`에서 오고, 그 위 호출자는 `selectNodeSchema` 462, `selectEntryStep` 44입니다. 줄 표본의 75%(379/506)가 함수 시작에서 13줄 떨어진 한 줄에 몰려 있습니다. 이는 선언 목록 순회로 보이며, 게이트 선언이 약 80개인 호스트를 가리킵니다. `selectNodeSchema.ts:92-96`은 `isAtomic`을 넘기는데, S3b는 게이트 선언과 atomic predicate를 제외합니다. 수정 명세: 구현 전에 탐침 fixture에서 호출을 (선언 수, 게이트 유무, `isAtomic` 유무)로 세는 진단을 S3b 행에 넣습니다. 단일 무게이트 몫이 작으면 제외합니다. 빌드 산출물이 없어 번들 줄을 소스 줄에 대응시키지는 못했습니다.

P3-2. S2의 형태가 `affectedByPresence`의 뜨거운 줄을 겨냥하는지 불확실합니다 (그럴듯함). 줄 표본 887개 중 559개(63%)가 메서드 시작에서 27줄 떨어진 한 줄에 있습니다. 바인딩 재검사 생략 자체는 의미가 동일하고 구체적입니다(`src/helpers/jsonPointer/utils/bindPointerTemplate.ts:15-16`, `hasPointerOperator.ts`). 다만 `collect`의 호출마다 생기는 할당(`getDependencyIndex.ts:353-371`의 events 배열, 클로저, `mapArray` 객체)은 다루지 않습니다. 수정 명세: S2 행에 "기대 절감은 탐침이 정하며 위 63% 줄의 정체는 미확인"이라는 문장을 넣습니다. payload-12는 Ⅳ-3-0에서 재지 않았으므로 표적이 아니라 보호 행으로 둡니다. 같은 이유로 S3b·S4·S5·S6b의 payload-12도 프로파일 근거가 없는 표적입니다.

P3-3. S6b가 오늘의 비용과 "증인"을 특정하지 않았습니다 (확인됨). Ⅳ-3-0에서 `assembleObject` self는 oneOf-80 왕복당 4.987 µs(5.07%)로 제품 함수 중 가장 크고, siblings-0에서는 0.645 µs입니다. 그런데 행에는 이 값이 없습니다. 또 B2-P3 후보 1에서는 조립 단계도 고정 상한을 넘지 못했습니다(6.208 > 3.000, B/A 0.642). 이 사실은 기각 이유 칸에서 빠졌습니다(`b2-p3-results.md`). 수정 명세: 이전 관측 칸에 두 값을 더합니다. 또 증인을 한 문장으로 특정합니다. 즉 "`children`이 `childEntries`의 첫 등장 순서와 같다는 사실을 무엇이 보장하는가"를 적습니다. 참고로 `objectShapes`는 이름 목록만 담고, `childOrderIndex`는 슬롯 순서를 담습니다.

P3-4. S5의 포함 수치 5.18과 2.28은 결과 문서가 아니라 독립 검토 문서에서 왔습니다 (확인됨). `iv-3-0-results.md`에는 `finalizeExits` 포함 10.798만 있습니다(:705). 두 값은 `reviews/iv-3-0-results-candidate-1-claude.md:39-40`에 있습니다. 수정 명세: S5 행의 출처에 그 검토 문서를 적습니다.

P3-5. payload-12의 동작 단위가 틀렸습니다 (확인됨). Phase 2의 3번은 "oneOf/payload는 왕복 2쓰기"라고 적습니다. 그런데 재사용하는 `tools/iv-3-0/helpers/setupOperation.mjs:21-25`는 `shape === 'oneOf'`일 때만 2쓰기입니다. payload-12는 `shape: 'branch-switch'`이므로 동작당 1쓰기입니다. 수정 명세: 해당 표현을 "payload는 1쓰기(두 분기를 번갈아 감)"로 고칩니다.

P3-6. 잡음 정의의 해석을 조정자가 확정해야 합니다. 브리프는 "세 A 반복의 최대 산포"라고만 적습니다. 설계는 행별 nᵣ로 판정하고, 행 전체의 최대는 기록만 합니다. 행마다 척도가 달라 행별 해석이 합리적이지만, Phase 1 검토 답변에서 명시적으로 확정해야 합니다.

P3-7. S8에는 경계값 퇴보와 위생 규칙 충돌을 적어야 합니다 (확인됨). 그 퇴보는 문턱을 0.062 µs(약 0.017%)만 넘었습니다(`micro-hygiene-results.md:642`). 두 되돌림은 #494에서 병합된 "제품 prototype 반복 229 → 0"을 한 곳씩 되살립니다. 브리프는 되돌림을 "제안"으로만 정했습니다. `af3e2e1d3`과 `b50f06050`은 squash 전 커밋이라 HEAD의 조상이 아니지만, 로컬 객체로는 존재합니다. 오늘의 두 지점은 밀집 배열이라 되돌려도 의미는 같습니다. 수정 명세: S8 행에 경계값 사실을 적습니다. 두 지점을 나누기 전에, 항목 5 전체를 되돌린 진단 탐침으로 원인이 항목 5인지 먼저 확인합니다. 유지 결정은 조정자 승인 뒤로 둡니다.

P3-8. NODE-044와 NODE-064는 Phase 2 공통 규칙으로 적어야 합니다. 지금은 S4 문단과 Phase 3의 "후보가 추가하거나 바꾼 계약의 NODE-044/064 … 보호도 유지한다"에만 있습니다. 그래서 후보가 그 계약을 바꿀 수 있다고 읽힐 여지가 있습니다. 수정 명세: Phase 2의 1번에 "NODE-044와 NODE-064는 어떤 후보도 바꾸지 않는다"를 넣습니다. Phase 3의 문장은 "새 공개 객체 발급과 떼어진 객체 불변"으로 다시 씁니다.

P3-9. 작은 문구 오류와 누락이 있습니다. S6a의 "호스트별 첫 읽기"는 "커밋 변경 뒤 첫 읽기"가 정확합니다(`materializeInactiveSlotValues.ts:18-19`, `commitSlotChanges.ts:52`). S7의 기각 이유에는 단계 두 항목(`commitSettlement`, `markCommitDeliveries`)의 실패가 빠졌습니다(`iv-1-results.md:111`). 상위 40개 중 표에 없는 큰 묶음도 있습니다. 포인터 문자열 함수군은 `resolvePointer` 1.476, `pathSegments` 0.967, `parsePointerSegment` 0.826, `escapeSegment` 0.817, `readFormattedPointerSegment` 0.764로 합이 약 4.85 µs/왕복입니다. 이 밖에 `getCommittedDeclarationKey` 1.726, `markRestoredSlotRaw` 1.428이 있습니다. 브리프상 이 행들의 추가는 선택입니다.

## 확인한 코드 주장

S4 주장은 확인됐습니다. `byNode`와 `byEdge`는 노드 객체를 키로 쓰는 WeakMap입니다(`src/core/engine/settle/utils/gates/getGateRegistry.ts:105-113,223-224`). 이 둘을 읽는 곳은 `locate`에서 `register(node)` 직후뿐입니다(:247-257). `remove`는 `byPath`와 `byLocation`만 지웁니다(:375-379, :519-538). 나감은 `finalizeExits.ts:77`에서 `remove`를 부릅니다. 재진입에서는 `cloneFromSlot`이 새 공개 수명을 발급하고(`cloneFromSlot.ts:11-17`), `selectEntryStep.ts:330`이 새로 등록합니다. 따라서 등록은 재진입을 건너 살아남지 않습니다. 병합안은 의미가 같습니다. 모든 읽기가 `register`가 보장한 `byPath.get(node.path).node === node` 뒤에 있기 때문입니다. 상주량은 WeakMap 항목 둘이 기존 레코드의 필드 둘로 바뀌어 줄어듭니다.

S6a 주장도 확인됐습니다. `inactiveValues`는 getter에서만 materialize됩니다(`src/core/surface/runtime/FieldNode.ts:239-241`). 변경 표시가 없으면 캐시를 돌려주고, 순서가 같으면 이전 배열을 재사용합니다(`materializeInactiveSlotValues.ts:18-19,42-49`). 커밋은 변경 표시만 합니다(`commitSlotChanges.ts:52`). 설계 Ⅱ도 같은 계약을 적습니다(`design-ii.md:21`). B2-P1b의 증분 journal 몫만 오늘 엔진에 없는데, 그 몫은 상주 journal이 필요합니다.

## S7 상주 한계의 정확한 내용

저장 내용: 청사진 하나당 서술자 객체 하나이고 필드는 셋입니다. 기존 호스트 template(`BlueprintNode`) 참조, 기존 경로 문자열 참조, 자격 값(불리언 또는 작은 정수)입니다. live 노드 참조는 없습니다.

크기: V8 포인터 압축 기준 약 24 바이트입니다(머리 12 바이트와 필드 3개 × 4 바이트). 압축이 없으면 약 40 바이트입니다. 여기에 청사진 파생 레코드의 속성 하나가 더해지며, 이는 최소 4 바이트와 숨은 클래스 전이 한 번입니다. 항목 수는 노드 수와 무관하게 청사진당 최대 1개입니다. 비교하면 Ⅳ-1의 경로별 Map은 leaf-gate 행에서 4,004개와 8,004개 항목이었습니다.

공유 범위: 폼 인스턴스 단위가 아니라 청사진 단위입니다. `Form` 경로는 `blueprintCacheDomain.cache`를 넘깁니다(`src/providers/RootNodeContext/utils/createRootLoad.ts:34`). 그래서 같은 스키마 객체와 같은 predicate를 쓰는 모든 폼이 서술자 하나를 공유합니다. 캐시 없이 `buildFieldNodeTree`를 부르는 시험·탐침 경로는 폼마다 청사진을 새로 만들므로 폼당 하나입니다. 수명은 청사진 수명(WeakMap)과 같습니다.

행에 빠진 것: 저장 위치(`getBlueprintDerived` 슬롯인지 `Blueprint` 필드인지)와 생성 시점입니다. 생성 시점이 첫 쓰기라면 첫 쓰기 추가항이 적용됩니다.

## 확인하지 못한 것

번들 줄과 소스 줄의 정확한 대응은 확인하지 못했습니다. 빌드 산출물이 없고 빌드는 금지되어 있기 때문입니다. P3-1과 P3-2는 줄 간격 추정에 기댑니다. Node 26.12.1의 `--heap-prof` 기본 동작도 확인하지 못했습니다(실험은 Node 24.20). 각 행의 실제 탐침 잡음과 기대 절감 크기는 탐침을 실행하지 않아 모릅니다. `structure` 작성 13곳의 prototype 분류도 전수 증명하지 않았습니다.
