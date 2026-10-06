## 107라운드 형태 고정과 남은 셋

기준 HEAD는 `e27f4b3b7e4c975adca702539889335f0b478fae`입니다. 같은 세션에서 A/A 9회차를 먼저 끝낸 뒤 한 변경씩 누적 기반과 비교했습니다. binding 리터럴은 기각·완전 복원했고 declaration slice, object assembly, 기본 choices는 순서대로 채택했습니다. S01과 정착 설계·공개 계약은 변경하지 않았습니다.

### Step A — 객체 생산과 mount 계수

blueprint·record·settle·behaviors의 TypeScript AST에서 객체 생산 지점 468곳을 열거했습니다. object spread는 48곳, object rest는 2곳이며 Object.assign은 없었습니다. 아래 표는 고정 리터럴과 미실행 지점까지 포함합니다. 계수는 원본 HEAD의 외부 instrumented copy에서 mount 한 번과 64 microtask·check-queue 종료까지 셌습니다. 후속 확인에서는 생성 객체 참조를 clock과 무관한 계수 실행에서 보유하여 helper 경유 키 추가도 최종 Object.keys로 관측했습니다. 첫 계수와 후속 HEAD 계수는 일치하며 이후 제품 변경의 계수는 섞지 않았습니다.

외부 복사본은 지정한 `scratchpad/bundles/batch2-step-a-copy`에 있으며 실제 계수·키 모양은 `profile-107-batch2/step-a.json`에 있습니다. 계수 번들은 timing에 사용하지 않았습니다. AST의 조건부 생성 후보에는 키 집합이 고정인 경우도 보수적으로 포함했습니다.

| 선택 | 지점 | nested-d5-f4 | flat-500 | sample-0 | 판단 |
| --- | --- | ---: | ---: | ---: | --- |
| 선택 1 | `appendChildEntries.ts:39` binding 선언 spread | 1,364 | 500 | 2 | 생산자 14개 열거 키·순서 그대로 리터럴 가능. 후속 측정에서 flat 회귀로 기각 |
| 미선택 | `mergeSingleStaticContribution.ts:64` 작성 schema 객체 | 1,365 | 501 | 3 | 작성 키와 필터에 따라 열거 키가 달라짐. undefined 필드를 추가하면 키 집합 변경; S01은 소유자 몫 |
| 미선택 | `commitStaticFirstNode.ts:21–22` event 숫자 키 | 각 1,365 | 각 501 | 각 3 | enum 상수 키 하나인 고정 모양 리터럴이며 spread·가변 키 복사 없음 |
| 미선택 | `assembleObject.ts:143` 결과 객체 | 341 | 1 | 1 | 작성된 자식 이름이 키를 결정하므로 고정 필드 리터럴 불가. 별도 Step B에서 Map/Set 작업만 제거 |

| 지점 | 파일:줄 | nested | flat | sample | 선택 여부·이유 |
| --- | --- | ---: | ---: | ---: | --- |
| 8: fixed literal | `src/core/blueprint/utils/analyze/buildNodes.ts:94` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 9: fixed literal | `src/core/blueprint/utils/analyze/buildNodes.ts:115` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 11: fixed literal | `src/core/blueprint/utils/analyze/collectDeclarations.ts:69` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 12: fixed literal | `src/core/blueprint/utils/analyze/collectDeclarations.ts:84` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 27: fixed literal | `src/core/blueprint/utils/analyze/getTemplateKey.ts:26` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 28: fixed literal | `src/core/blueprint/utils/analyze/getTemplateKey.ts:89` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 108: variable runtime keys | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:64` | 1365 | 501 | 3 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 110: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:96` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 148: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:56` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 336: fixed literal | `src/core/settle/utils/load/commitStaticFirstNode.ts:18` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 337: fixed literal | `src/core/settle/utils/load/commitStaticFirstNode.ts:20` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 338: computed keys | `src/core/settle/utils/load/commitStaticFirstNode.ts:21` | 1365 | 501 | 3 | 미선택: 상수 event 키의 고정 모양 리터럴 |
| 339: computed keys | `src/core/settle/utils/load/commitStaticFirstNode.ts:22` | 1365 | 501 | 3 | 미선택: 상수 event 키의 고정 모양 리터럴 |
| 340: fixed literal | `src/core/settle/utils/load/commitStaticFirstNode.ts:22` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 464: fixed literal | `src/core/behaviors/utils/options/getStaticChoices.ts:32` | 1365 | 501 | 3 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 30: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts:39` | 1364 | 500 | 2 | 선택 1: 고정 선언 필드 순서의 리터럴 가능 |
| 31: fixed literal | `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts:58` | 1364 | 500 | 2 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 33: variable keys | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:53` | 1364 | 500 | 2 | 미선택: 기존 필드 값 재대입; 이미 동일 순서 리터럴 |
| 355: conditional object | `src/core/settle/utils/load/loadStaticFirstTree.ts:108` | 1364 | 500 | 2 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 32: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:41` | 341 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 142: variable runtime keys | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:42` | 341 | 1 | 1 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 335: conditional object | `src/core/settle/utils/load/commitStaticFirstNode.ts:17` | 341 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 351: variable runtime keys | `src/core/settle/utils/load/getStaticObjectEntries.ts:14` | 341 | 1 | 1 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 354: variable runtime keys | `src/core/settle/utils/load/loadStaticFirstTree.ts:76` | 341 | 1 | 1 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 457: variable runtime keys | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:143` | 341 | 1 | 1 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 458: fixed literal | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:148` | 341 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 403: conditional object | `src/core/settle/utils/write/staticSpec.ts:26` | 2 | 0 | 0 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 1: variable keys | `src/core/blueprint/blueprint.ts:37` | 1 | 1 | 1 | 미선택: 조건부 필드 추가·작성 키를 보존해야 함 |
| 2: fixed literal | `src/core/blueprint/blueprint.ts:39` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 3: fixed literal | `src/core/blueprint/blueprint.ts:60` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 4: fixed literal | `src/core/blueprint/blueprint.ts:102` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 5: Object.create | `src/core/blueprint/blueprint.ts:110` | 1 | 1 | 1 | 미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요 |
| 348: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:52` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 352: fixed literal | `src/core/settle/utils/load/loadSchemaNodeAtMount.ts:19` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 353: fixed literal | `src/core/settle/utils/load/loadStaticFirstTree.ts:51` | 1 | 1 | 1 | 미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음 |
| 0: fixed literal | `src/core/blueprint/blueprint.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 6: conditional object | `src/core/blueprint/blueprint.ts:135` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 7: object spread | `src/core/blueprint/utils/analyze/buildNodes.ts:79` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 10: conditional object | `src/core/blueprint/utils/analyze/collectDeclarations.ts:62` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 13: object spread | `src/core/blueprint/utils/analyze/collectDeclarations.ts:132` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 14: conditional object | `src/core/blueprint/utils/analyze/collectDeclarations.ts:167` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 15: conditional object | `src/core/blueprint/utils/analyze/collectDeclarations.ts:176` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 16: fixed literal | `src/core/blueprint/utils/analyze/collectDeclarations.ts:191` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 17: fixed literal | `src/core/blueprint/utils/analyze/collectStaticSchemas.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 18: conditional object | `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 19: Object.create | `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts:31` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 20: fixed literal | `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts:90` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 21: fixed literal | `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts:103` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 22: object spread | `src/core/blueprint/utils/analyze/createBlueprintGate.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 23: conditional object | `src/core/blueprint/utils/analyze/createBlueprintGate.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 24: conditional object | `src/core/blueprint/utils/analyze/createBlueprintGate.ts:16` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 25: fixed literal | `src/core/blueprint/utils/analyze/getTemplateKey.ts:6` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 26: fixed literal | `src/core/blueprint/utils/analyze/getTemplateKey.ts:7` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 29: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 34: fixed literal | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:89` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 35: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:94` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 36: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:99` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 37: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:99` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 38: fixed literal | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:113` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 39: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:129` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 40: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:143` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 41: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:154` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 42: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:167` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 43: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:172` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 44: conditional object | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:191` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 45: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:194` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 46: object spread | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:210` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 47: conditional object | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 48: conditional object | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:52` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 49: conditional object | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:64` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 50: conditional object | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:76` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 51: fixed literal | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:81` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 52: conditional object | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:100` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 53: object spread | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:112` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 54: fixed literal | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:119` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 55: fixed literal | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:134` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 56: conditional object | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:45` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 57: conditional object | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:95` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 58: conditional object | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:111` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 59: conditional object | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:122` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 60: fixed literal | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:129` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 61: conditional object | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:137` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 62: conditional object | `src/core/blueprint/utils/analyze/readSchemaObject.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 63: conditional object | `src/core/blueprint/utils/analyze/resolveReference.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 64: fixed literal | `src/core/blueprint/utils/analyze/resolveReference.ts:41` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 65: conditional object | `src/core/blueprint/utils/analyze/resolveReference.ts:57` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 66: fixed literal | `src/core/blueprint/utils/analyze/resolveReference.ts:60` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 67: conditional object | `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 68: object spread | `src/core/blueprint/utils/declarations/copyBlueprintDeclarations.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 69: fixed literal | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 70: fixed literal | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:41` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 71: conditional object | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 72: conditional object | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:63` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 73: conditional object | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:115` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 74: conditional object | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:119` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 75: fixed literal | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 76: conditional object | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:59` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 77: fixed literal | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:68` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 78: fixed literal | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:90` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 79: conditional object | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:101` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 80: conditional object | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:110` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 81: conditional object | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:114` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 82: fixed literal | `src/core/blueprint/utils/diagnostics/constant.ts:2` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 83: fixed literal | `src/core/blueprint/utils/diagnostics/constant.ts:31` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 84: fixed literal | `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 85: fixed literal | `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 86: object spread | `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 87: conditional object | `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 88: conditional object | `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 89: conditional object | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 90: conditional object | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:45` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 91: conditional object | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:57` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 92: conditional object | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:65` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 93: conditional object | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:82` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 94: fixed literal | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:89` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 95: fixed literal | `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 96: object spread | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 97: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:51` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 98: computed keys | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:51` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 99: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:80` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 100: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:99` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 101: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:115` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 102: object spread | `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 103: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts:32` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 104: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 105: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:25` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 106: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:56` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 107: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts:41` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 109: variable keys | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:73` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 111: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 112: fixed literal | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 113: conditional object | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 114: fixed literal | `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:48` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 115: fixed literal | `src/core/blueprint/utils/expressions/getPathManager/getPathManager.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 116: fixed literal | `src/core/blueprint/utils/features/getFeatureNodeIndex/getFeatureNodeIndex.ts:9` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 117: fixed literal | `src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts:26` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 118: conditional object | `src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 119: fixed literal | `src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts:67` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 120: object spread | `src/core/blueprint/utils/itemEntry/getItemEntry.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 121: fixed literal | `src/core/blueprint/utils/itemEntry/getItemEntry.ts:57` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 122: fixed literal | `src/core/blueprint/utils/resolveArrayLimits/resolveArrayLimits.ts:25` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 123: fixed literal | `src/core/blueprint/utils/stripSchema/constant.ts:9` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 124: fixed literal | `src/core/blueprint/utils/stripSchema/stripSchema.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 125: fixed literal | `src/core/blueprint/utils/stripSchema/stripSchema.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 126: object rest | `src/core/blueprint/utils/stripSchema/stripSchema.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 127: fixed literal | `src/core/blueprint/utils/stripSchema/stripSchema.ts:42` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 128: object spread | `src/core/blueprint/utils/stripSchema/utils/copySchemaContainers.ts:14` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 129: object spread | `src/core/blueprint/utils/stripSchema/utils/copySchemaContainers.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 130: object rest | `src/core/blueprint/utils/stripSchema/utils/removeFormGroups.ts:19` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 131: fixed literal | `src/core/blueprint/utils/types/foldAllowedTypes.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 132: conditional object | `src/core/blueprint/utils/types/inferAllowedTypes.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 133: conditional object | `src/core/blueprint/utils/types/inferAllowedTypes.ts:54` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 134: conditional object | `src/core/blueprint/utils/types/inferAllowedTypes.ts:81` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 135: conditional object | `src/core/blueprint/utils/types/inferAllowedTypes.ts:101` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 136: fixed literal | `src/core/blueprint/utils/types/inferAllowedTypes.ts:117` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 137: conditional object | `src/core/blueprint/utils/types/inferLiteralTypes.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 138: conditional object | `src/core/blueprint/utils/types/inferLiteralTypes.ts:54` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 139: fixed literal | `src/core/blueprint/utils/types/inferLiteralTypes.ts:66` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 140: conditional object | `src/core/blueprint/utils/types/readAllowedTypes.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 141: conditional object | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 143: conditional object | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:54` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 144: conditional object | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:61` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 145: conditional object | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:62` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 146: conditional object | `src/core/blueprint/utils/types/resolveNodeStrategy.ts:77` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 147: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:46` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 149: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:75` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 150: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:79` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 151: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:100` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 152: conditional object | `src/core/blueprint/utils/types/resolveNodeTypes.ts:109` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 153: object spread | `src/core/blueprint/utils/types/resolveNodeTypes.ts:111` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 154: fixed literal | `src/core/record/type.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 155: conditional object | `src/core/record/utils/SchemaNodeRevisionLedger.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 156: fixed literal | `src/core/record/utils/captureSchemaNodeChange.ts:5` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 157: conditional object | `src/core/record/utils/markSchemaNodeEvent.ts:19` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 158: conditional object | `src/core/record/utils/markSchemaNodeEvent.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 159: conditional object | `src/core/record/utils/markSchemaNodeEvent.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 160: computed keys | `src/core/record/utils/markSchemaNodeEvent.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 161: computed keys | `src/core/record/utils/markSchemaNodeEvent.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 162: object spread | `src/core/record/utils/publishGlobalStateDeltas.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 163: fixed literal | `src/core/record/utils/publishGlobalStateDeltas.ts:26` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 164: object spread | `src/core/record/utils/publishGlobalStateDeltas.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 165: object spread | `src/core/record/utils/shallowPatch.ts:14` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 166: conditional object | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 167: conditional object | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:91` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 168: fixed literal | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:124` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 169: conditional object | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:137` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 170: fixed literal | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:142` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 171: fixed literal | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:159` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 172: fixed literal | `src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts:53` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 173: conditional object | `src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts:64` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 174: fixed literal | `src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts:72` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 175: object spread | `src/core/settle/derive/utils/evaluate/utils/chooseDeriveWrite.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 176: conditional object | `src/core/settle/derive/utils/evaluate/utils/chooseDeriveWrite.ts:32` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 177: conditional object | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 178: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 179: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 180: conditional object | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 181: conditional object | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 182: conditional object | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:42` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 183: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 184: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 185: conditional object | `src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 186: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts:33` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 187: fixed literal | `src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 188: conditional object | `src/core/settle/derive/utils/evaluate/utils/getInjectTarget.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 189: fixed literal | `src/core/settle/derive/utils/evaluate/utils/getInjectTarget.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 190: fixed literal | `src/core/settle/derive/utils/evaluate/utils/getInjectToContext.ts:11` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 191: fixed literal | `src/core/settle/derive/utils/evaluate/utils/getInjectToContext.ts:19` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 192: fixed literal | `src/core/settle/derive/utils/evaluate/utils/getVirtualWriteFailure.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 193: conditional object | `src/core/settle/derive/utils/evaluate/utils/readDeriveDependency.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 194: conditional object | `src/core/settle/derive/utils/rank/getDeriveChildEntry.ts:31` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 195: fixed literal | `src/core/settle/derive/utils/rank/kindRank.ts:2` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 196: fixed literal | `src/core/settle/derive/utils/rank/layerRank.ts:2` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 197: fixed literal | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 198: conditional object | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:62` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 199: conditional object | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:68` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 200: conditional object | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:83` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 201: fixed literal | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:106` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 202: fixed literal | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:117` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 203: fixed literal | `src/core/settle/utils/commit/collectNonJsonPaths.ts:13` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 204: fixed literal | `src/core/settle/utils/commit/collectNonJsonPaths.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 205: conditional object | `src/core/settle/utils/commit/collectNonJsonPaths.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 206: conditional object | `src/core/settle/utils/commit/collectNonJsonPaths.ts:44` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 207: fixed literal | `src/core/settle/utils/commit/commitDeriveRules.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 208: computed keys | `src/core/settle/utils/commit/commitDeriveRules.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 209: fixed literal | `src/core/settle/utils/commit/commitExitPolicyValues.ts:115` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 210: fixed literal | `src/core/settle/utils/commit/commitGlobalState.ts:41` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 211: conditional object | `src/core/settle/utils/commit/commitGlobalState.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 212: conditional object | `src/core/settle/utils/commit/commitGlobalState.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 213: object spread | `src/core/settle/utils/commit/commitSettlement.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 214: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 215: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 216: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 217: object spread | `src/core/settle/utils/commit/commitSettlement.ts:54` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 218: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 219: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:56` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 220: object spread | `src/core/settle/utils/commit/commitSettlement.ts:86` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 221: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:88` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 222: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:91` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 223: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:91` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 224: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:100` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 225: object spread | `src/core/settle/utils/commit/commitSettlement.ts:103` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 226: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:105` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 227: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:105` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 228: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:110` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 229: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:122` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 230: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:125` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 231: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:128` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 232: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:141` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 233: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:144` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 234: conditional object | `src/core/settle/utils/commit/commitSettlement.ts:160` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 235: fixed literal | `src/core/settle/utils/commit/conversionCandidates.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 236: object spread | `src/core/settle/utils/commit/finalizeDeriveTrace.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 237: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:141` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 238: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:143` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 239: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:144` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 240: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:149` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 241: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:155` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 242: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:175` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 243: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:181` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 244: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:182` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 245: conditional object | `src/core/settle/utils/commit/markCommitDeliveries.ts:187` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 246: fixed literal | `src/core/settle/utils/commit/snapshotExitedPolicies.ts:25` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 247: object spread | `src/core/settle/utils/commit/snapshotExitedPolicies.ts:29` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 248: conditional object | `src/core/settle/utils/commit/updateInactiveValuesMemo.ts:44` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 249: fixed literal | `src/core/settle/utils/commit/updateInactiveValuesMemo.ts:58` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 250: conditional object | `src/core/settle/utils/commit/updateInactiveValuesMemo.ts:61` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 251: fixed literal | `src/core/settle/utils/commit/utils/createWatchDeliveryIndex.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 252: conditional object | `src/core/settle/utils/commit/utils/createWatchDeliveryIndex.ts:44` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 253: fixed literal | `src/core/settle/utils/compute/computeNode.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 254: fixed literal | `src/core/settle/utils/compute/computeNode.ts:73` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 255: fixed literal | `src/core/settle/utils/compute/flushPendingOutput.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 256: variable keys | `src/core/settle/utils/compute/primeHost.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 257: fixed literal | `src/core/settle/utils/compute/primeHost.ts:51` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 258: fixed literal | `src/core/settle/utils/compute/publishStateKeys.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 259: Object.create | `src/core/settle/utils/compute/selectChildren.ts:53` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 260: fixed literal | `src/core/settle/utils/compute/selectChildren.ts:56` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 261: fixed literal | `src/core/settle/utils/compute/selectChildren.ts:66` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 262: Object.create | `src/core/settle/utils/compute/selectChildren.ts:113` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 263: object spread | `src/core/settle/utils/compute/selectChildren.ts:132` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 264: conditional object | `src/core/settle/utils/compute/selectChildren.ts:201` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 265: conditional object | `src/core/settle/utils/compute/selectChildren.ts:227` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 266: fixed literal | `src/core/settle/utils/compute/selectChildren.ts:260` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 267: conditional object | `src/core/settle/utils/compute/selectChildren.ts:274` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 268: conditional object | `src/core/settle/utils/compute/selectNodeSchema.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 269: conditional object | `src/core/settle/utils/compute/selectNodeSchema.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 270: conditional object | `src/core/settle/utils/compute/selectNodeSchema.ts:46` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 271: fixed literal | `src/core/settle/utils/compute/selectNodeSchema.ts:52` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 272: conditional object | `src/core/settle/utils/compute/selectNodeSchema.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 273: conditional object | `src/core/settle/utils/compute/updateOutput.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 274: fixed literal | `src/core/settle/utils/controls/calculateStateKeys.ts:11` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 275: fixed literal | `src/core/settle/utils/controls/calculateStateKeys.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 276: fixed literal | `src/core/settle/utils/controls/calculateStateKeys.ts:13` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 277: fixed literal | `src/core/settle/utils/controls/calculateStateKeys.ts:14` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 278: variable keys | `src/core/settle/utils/controls/calculateStateKeys.ts:66` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 279: conditional object | `src/core/settle/utils/controls/calculateStateKeys.ts:88` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 280: object spread | `src/core/settle/utils/controls/calculateStateKeys.ts:95` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 281: fixed literal | `src/core/settle/utils/controls/calculateStateKeys.ts:97` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 282: fixed literal | `src/core/settle/utils/controls/getCommittedDeclarationKey.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 283: conditional object | `src/core/settle/utils/controls/getControlLayers.ts:72` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 284: conditional object | `src/core/settle/utils/controls/getControlLayers.ts:99` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 285: conditional object | `src/core/settle/utils/controls/getControlLayers.ts:110` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 286: fixed literal | `src/core/settle/utils/controls/readSchemaNodeWatchValues.ts:42` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 287: conditional object | `src/core/settle/utils/controls/readStateDependency.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 288: object spread | `src/core/settle/utils/derivation/captureDeriveBaseline.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 289: fixed literal | `src/core/settle/utils/derivation/getDeriveState.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 290: fixed literal | `src/core/settle/utils/derivation/runDeriveRounds.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 291: fixed literal | `src/core/settle/utils/derivation/runDeriveRounds.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 292: object spread | `src/core/settle/utils/derivation/runDeriveRounds.ts:46` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 293: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:51` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 294: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:51` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 295: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:52` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 296: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:53` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 297: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:69` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 298: conditional object | `src/core/settle/utils/derivation/runDeriveRounds.ts:97` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 299: fixed literal | `src/core/settle/utils/detached/captureDetachedSchemaNodeReads.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 300: conditional object | `src/core/settle/utils/dispose/assertSchemaNodeWritable.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 301: conditional object | `src/core/settle/utils/errors/recordSettlementFailure.ts:29` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 302: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 303: object spread | `src/core/settle/utils/gates/evaluateGate.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 304: object spread | `src/core/settle/utils/gates/evaluateGate.ts:60` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 305: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:83` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 306: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:88` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 307: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:92` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 308: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:98` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 309: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:114` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 310: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:129` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 311: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:134` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 312: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:138` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 313: conditional object | `src/core/settle/utils/gates/evaluateGate.ts:141` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 314: variable keys | `src/core/settle/utils/gates/flushPendingGateReads.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 315: fixed literal | `src/core/settle/utils/gates/flushPendingGateReads.ts:49` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 316: fixed literal | `src/core/settle/utils/gates/flushPendingGateReads.ts:56` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 317: fixed literal | `src/core/settle/utils/gates/getGateBudgetCap.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 318: fixed literal | `src/core/settle/utils/gates/getGateBudgetCap.ts:79` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 319: fixed literal | `src/core/settle/utils/gates/getGateRegistry.ts:76` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 320: fixed literal | `src/core/settle/utils/gates/getGateRegistry.ts:95` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 321: object spread | `src/core/settle/utils/gates/getGateRegistry.ts:144` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 322: fixed literal | `src/core/settle/utils/gates/getGateRegistry.ts:205` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 323: fixed literal | `src/core/settle/utils/gates/resolveGateOccurrence.ts:34` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 324: object spread | `src/core/settle/utils/latent/readLatentSlotSource.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 325: conditional object | `src/core/settle/utils/latent/readLatentSlotSource.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 326: fixed literal | `src/core/settle/utils/latent/readLatentSlotSource.ts:47` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 327: object spread | `src/core/settle/utils/latent/readRawTree.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 328: conditional object | `src/core/settle/utils/latent/readRawTree.ts:40` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 329: fixed literal | `src/core/settle/utils/latent/readRawTree.ts:48` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 330: conditional object | `src/core/settle/utils/latent/setLatentRaw.ts:37` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 331: conditional object | `src/core/settle/utils/latent/setLatentRaw.ts:45` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 332: object spread | `src/core/settle/utils/load/alignArraySnapshotSlots.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 333: fixed literal | `src/core/settle/utils/load/alignArraySnapshotSlots.ts:45` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 334: fixed literal | `src/core/settle/utils/load/clearSubtreeState.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 341: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:26` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 342: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:26` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 343: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 344: object spread | `src/core/settle/utils/load/finishStaticFirstLoad.ts:41` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 345: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 346: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:43` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 347: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:46` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 349: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 350: conditional object | `src/core/settle/utils/load/finishStaticFirstLoad.ts:68` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 356: conditional object | `src/core/settle/utils/load/loadStaticFirstTree.ts:115` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 357: object spread | `src/core/settle/utils/load/readStaticFirstWarning.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 358: fixed literal | `src/core/settle/utils/load/readStaticFirstWarning.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 359: conditional object | `src/core/settle/utils/load/readStaticFirstWarning.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 360: conditional object | `src/core/settle/utils/load/readStaticFirstWarning.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 361: fixed literal | `src/core/settle/utils/load/resetSchemaNodeForm.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 362: object spread | `src/core/settle/utils/load/setLoadValue.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 363: conditional object | `src/core/settle/utils/load/setLoadValue.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 364: fixed literal | `src/core/settle/utils/pathIndex/getRuntimePathStores.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 365: fixed literal | `src/core/settle/utils/paths/expandTemplatePaths.ts:19` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 366: conditional object | `src/core/settle/utils/paths/expandTemplatePaths.ts:33` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 367: conditional object | `src/core/settle/utils/paths/expandTemplatePaths.ts:42` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 368: fixed literal | `src/core/settle/utils/settlement/createSettlementContext.ts:26` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 369: conditional object | `src/core/settle/utils/settlement/finishSettlement.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 370: conditional object | `src/core/settle/utils/settlement/finishSettlement.ts:69` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 371: fixed literal | `src/core/settle/utils/structure/applyArraySlots.ts:34` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 372: Object.create | `src/core/settle/utils/structure/applyArraySlots.ts:47` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 373: fixed literal | `src/core/settle/utils/structure/applyArraySlots.ts:70` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 374: fixed literal | `src/core/settle/utils/structure/applyArraySlots.ts:78` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 375: conditional object | `src/core/settle/utils/structure/applyArraySlots.ts:84` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 376: fixed literal | `src/core/settle/utils/structure/applyArraySlots.ts:103` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 377: fixed literal | `src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts:56` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 378: fixed literal | `src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts:78` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 379: object spread | `src/core/settle/utils/structure/utils/rekeyLatentMetadata.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 380: conditional object | `src/core/settle/utils/structure/utils/rekeyPairedPathStore.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 381: fixed literal | `src/core/settle/utils/structure/utils/rekeyPairedPathStore.ts:34` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 382: conditional object | `src/core/settle/utils/transition/captureLatentDescendants.ts:55` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 383: fixed literal | `src/core/settle/utils/transition/captureLatentDescendants.ts:63` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 384: fixed literal | `src/core/settle/utils/transition/captureLatentDescendants.ts:82` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 385: conditional object | `src/core/settle/utils/transition/finalizeExits.ts:32` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 386: conditional object | `src/core/settle/utils/transition/finalizePerished.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 387: Object.create | `src/core/settle/utils/transition/restoreArrayStructure.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 388: conditional object | `src/core/settle/utils/transition/transitionSettlement.ts:92` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 389: conditional object | `src/core/settle/utils/transition/transitionSettlement.ts:149` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 390: conditional object | `src/core/settle/utils/transition/transitionSettlement.ts:161` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 391: conditional object | `src/core/settle/utils/write/assertVirtualWriteShape.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 392: fixed literal | `src/core/settle/utils/write/getDependencyIndex.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 393: conditional object | `src/core/settle/utils/write/getDependencyIndex.ts:135` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 394: conditional object | `src/core/settle/utils/write/getDependencyIndex.ts:143` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 395: conditional object | `src/core/settle/utils/write/getSettlementScratch.ts:13` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 396: object spread | `src/core/settle/utils/write/interpretSchemaNodeInput.ts:53` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 397: conditional object | `src/core/settle/utils/write/markWrite.ts:38` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 398: conditional object | `src/core/settle/utils/write/markWrite.ts:73` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 399: fixed literal | `src/core/settle/utils/write/markWrite.ts:107` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 400: fixed literal | `src/core/settle/utils/write/nextExtras.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 401: conditional object | `src/core/settle/utils/write/nextExtras.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 402: fixed literal | `src/core/settle/utils/write/nextExtras.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 404: fixed literal | `src/core/settle/utils/write/staticSpec.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 405: fixed literal | `src/core/behaviors/arrayBehavior/arrayBehavior.ts:7` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 406: fixed literal | `src/core/behaviors/arrayBehavior/branch/arrayBranchBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 407: fixed literal | `src/core/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 408: fixed literal | `src/core/behaviors/arrayBehavior/terminal/arrayTerminalBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 409: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 410: fixed literal | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:16` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 411: fixed literal | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 412: fixed literal | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 413: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 414: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 415: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 416: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:25` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 417: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 418: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:28` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 419: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:30` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 420: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:32` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 421: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:34` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 422: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:34` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 423: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 424: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:14` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 425: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:17` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 426: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 427: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 428: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 429: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 430: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 431: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 432: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:25` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 433: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:27` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 434: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:31` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 435: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:32` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 436: fixed literal | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:35` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 437: fixed literal | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts:36` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 438: conditional object | `src/core/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts:12` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 439: fixed literal | `src/core/behaviors/arrayBehavior/utils/projection/omitTrailingArray.ts:42` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 440: fixed literal | `src/core/behaviors/arrayBehavior/utils/value/assembleArray.ts:78` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 441: conditional object | `src/core/behaviors/arrayBehavior/utils/value/holeValue.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 442: fixed literal | `src/core/behaviors/behaviors.ts:18` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 443: fixed literal | `src/core/behaviors/behaviors.ts:19` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 444: fixed literal | `src/core/behaviors/behaviors.ts:20` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 445: fixed literal | `src/core/behaviors/behaviors.ts:21` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 446: fixed literal | `src/core/behaviors/behaviors.ts:22` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 447: fixed literal | `src/core/behaviors/behaviors.ts:23` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 448: fixed literal | `src/core/behaviors/behaviors.ts:24` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 449: fixed literal | `src/core/behaviors/booleanBehavior/booleanBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 450: fixed literal | `src/core/behaviors/nullBehavior/nullBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 451: fixed literal | `src/core/behaviors/numberBehavior/numberBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 452: fixed literal | `src/core/behaviors/objectBehavior/branch/objectBranchBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 453: object spread | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:39` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 454: object spread | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:75` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 455: object spread | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:133` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 456: conditional object | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:137` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 459: fixed literal | `src/core/behaviors/objectBehavior/objectBehavior.ts:9` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 460: fixed literal | `src/core/behaviors/objectBehavior/terminal/objectTerminalBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 461: conditional object | `src/core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts:8` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 462: fixed literal | `src/core/behaviors/stringBehavior/stringBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 463: fixed literal | `src/core/behaviors/unionBehavior/unionBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 465: conditional object | `src/core/behaviors/utils/options/isOmittedEmpty.ts:15` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 466: fixed literal | `src/core/behaviors/utils/slots/rejectArrayOperation.ts:13` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |
| 467: fixed literal | `src/core/behaviors/virtualBehavior/virtualBehavior.ts:10` | 0 | 0 | 0 | 미선택: 세 fixture mount에서 0회 |

### 측정·판정 조건

기존 `profile-104-owned/measure.mjs`의 production 종단 clock을 메모리 adapter로 유지했습니다. fresh process, 외부 강제 GC, warmup 20, 회차당 101 H/W 쌍, 표본마다 H/W 순서 교대, clone·관측·파일 쓰기는 clock 밖입니다. 64 microtask와 check-queue sentinel은 clock 안이며 두 판의 빈 종단을 같이 관측합니다. 매 행은 909개 paired H−W 차이를 pooled median으로 집계했고 canonical seed 101·1,999 bootstrap trials의 99% 구간을 사용했습니다. 모든 값의 단위는 ms이며 양수는 후보가 빠르다는 뜻입니다.

채택은 어떤 행의 구간 하한이 0보다 크고 중앙값이 같은 A/A 행 통계보다 큰 경우입니다. 회귀는 구간 상한이 0보다 작고 |중앙값|이 max(|A/A|, 해당 누적 기반 중앙값의 0.5%)를 넘는 경우입니다. 회귀 행이 하나라도 있으면 전부 기각했습니다. 구간 비교는 JSON의 원래 정밀도로 수행하며 표는 소수점 여섯 자리로 표시합니다. 따라서 극소 양수 하한은 표에서 0.000000으로 반올림될 수 있습니다. 개선 크기의 0.5% 하한은 추가하지 않았습니다.

### A/A — HEAD 대 HEAD 아홉 회차

| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| nested-d5-f4 마운트 | -0.029584 | [-0.047501, -0.012708] | -0.029584 | 4.843708 | 0.024219 | A/A 대조 |
| flat-500 마운트 | -0.000126 | [-0.005042, 0.005708] | -0.000126 | 1.595334 | 0.007977 | A/A 대조 |
| oneOf-20 마운트 | -0.000708 | [-0.005750, 0.007999] | -0.000708 | 2.070499 | 0.010352 | A/A 대조 |
| sample-0 마운트 | -0.000541 | [-0.001375, 0.000333] | -0.000541 | 0.097917 | 0.000490 | A/A 대조 |
| sample-0 첫 갱신 | 0.000167 | [-0.000292, 0.000625] | 0.000167 | 0.083542 | 0.000418 | A/A 대조 |
| sample-0 후속 갱신 | 0.000417 | [-0.000333, 0.001000] | 0.000417 | 0.080750 | 0.000404 | A/A 대조 |
| nested-d5-f4 첫 갱신 | 0.040500 | [-0.070626, 0.071250] | 0.040500 | 0.186666 | 0.000933 | A/A 대조 |
| nested-d5-f4 후속 갱신 | 0.000083 | [-0.000750, 0.000875] | 0.000083 | 0.109792 | 0.000549 | A/A 대조 |
| oneOf-40 첫 갱신 | 0.007791 | [0.003292, 0.011042] | 0.007791 | 1.482041 | 0.007410 | A/A 대조 |
| oneOf-40 후속 갱신 | 0.009501 | [0.006375, 0.012791] | 0.009501 | 0.972250 | 0.004861 | A/A 대조 |

### 1-binding-literal — 기각

측정 기반 source tree: `506370350969951adde2b04f35a7fdfc1f697a84f2b5b87887c8685dfc114099`; 후보: `9e0657b076eae0703cd76a81542913239e0a6e79f6b31fa62f07a71ea5fdccac`. 이전 채택분만 기반에 포함했습니다.

고정 14개 필드 직접 읽기·쓰기로 spread를 제거하되 같은 객체 하나와 독립 gates/order 두 배열을 유지했습니다. 새 보유 자료는 없습니다. 측정 결과 flat 회귀로 소스·시험·DETAIL 모두 복원했습니다.

변경 전/후 개발·운영의 59-schema 차등(collect 끔/켬), 소유·동결, path-key 및 binding 키 순서·재바인딩 시험 각 12건 통과. 동작 보존 refactor의 characterization을 먼저 실행했습니다.

| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| nested-d5-f4 마운트 | -0.007208 | [-0.024209, 0.008667] | -0.029584 | 4.853584 | 0.024268 | 채택 조건 미충족 |
| flat-500 마운트 | -0.012209 | [-0.017374, -0.007625] | -0.000126 | 1.605958 | 0.008030 | 회귀 |
| oneOf-20 마운트 | 0.001375 | [-0.008292, 0.010293] | -0.000708 | 2.079083 | 0.010395 | 채택 조건 미충족 |
| sample-0 마운트 | -0.000542 | [-0.001375, 0.000374] | -0.000541 | 0.103458 | 0.000517 | 채택 조건 미충족 |
| sample-0 첫 갱신 | -0.000083 | [-0.000792, 0.000582] | 0.000167 | 0.084875 | 0.000424 | 채택 조건 미충족 |
| sample-0 후속 갱신 | 0.000374 | [-0.000374, 0.001125] | 0.000417 | 0.079250 | 0.000396 | 채택 조건 미충족 |
| nested-d5-f4 첫 갱신 | 0.039000 | [-0.068667, 0.071833] | 0.040500 | 0.187792 | 0.000939 | 채택 조건 미충족 |
| nested-d5-f4 후속 갱신 | 0.001126 | [0.000376, 0.001750] | 0.000083 | 0.111042 | 0.000555 | 개선 |
| oneOf-40 첫 갱신 | 0.002541 | [-0.001332, 0.005709] | 0.007791 | 1.481208 | 0.007406 | 채택 조건 미충족 |
| oneOf-40 후속 갱신 | 0.011000 | [0.007958, 0.013750] | 0.009501 | 0.971667 | 0.004858 | 개선 |

기각 patch는 만들지 않았습니다. 다음 기반은 HEAD와 같은 source tree이며 신규 binding 시험은 삭제했습니다.

### 2-declaration-slice — 채택

측정 기반 source tree: `506370350969951adde2b04f35a7fdfc1f697a84f2b5b87887c8685dfc114099`; 후보: `ecf2d60e45e154da59a69cda23edd0f8cbf3506ebf0b9f1e5e6d4e90e2d320b9`. 이전 채택분만 기반에 포함했습니다.

collectDeclarations의 네 packed gates/order 복사를 native slice로 바꿨습니다. 같은 원소 수의 native 복사이며 배열 네 개와 별도 소유·개발 동결은 그대로입니다. 새 보유 자료는 없습니다.

입력 소속 배열 iterator 계수는 변경 전 6회로 기대 0에 실패했고 변경 후 0회입니다. 개발·운영 owned-inline·path-key 각 21건 통과. fragment/declaration의 gates/order가 별도 배열임을 관측합니다.

| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| nested-d5-f4 마운트 | 0.012375 | [-0.004458, 0.033333] | -0.029584 | 4.846000 | 0.024230 | 채택 조건 미충족 |
| flat-500 마운트 | 0.006376 | [0.001042, 0.011584] | -0.000126 | 1.604750 | 0.008024 | 개선 |
| oneOf-20 마운트 | -0.007333 | [-0.013500, 0.000917] | -0.000708 | 2.070791 | 0.010354 | 채택 조건 미충족 |
| sample-0 마운트 | -0.000500 | [-0.001376, 0.000708] | -0.000541 | 0.099083 | 0.000495 | 채택 조건 미충족 |
| sample-0 첫 갱신 | -0.000291 | [-0.000918, 0.000291] | 0.000167 | 0.084042 | 0.000420 | 채택 조건 미충족 |
| sample-0 후속 갱신 | 0.000583 | [0.000000, 0.001125] | 0.000417 | 0.079459 | 0.000397 | 채택 조건 미충족 |
| nested-d5-f4 첫 갱신 | 0.049916 | [-0.071291, 0.070917] | 0.040500 | 0.189208 | 0.000946 | 채택 조건 미충족 |
| nested-d5-f4 후속 갱신 | 0.001125 | [0.000457, 0.002083] | 0.000083 | 0.110584 | 0.000553 | 개선 |
| oneOf-40 첫 갱신 | 0.001666 | [-0.001250, 0.005500] | 0.007791 | 1.473750 | 0.007369 | 채택 조건 미충족 |
| oneOf-40 후속 갱신 | 0.009542 | [0.005833, 0.012584] | 0.009501 | 0.958958 | 0.004795 | 개선 |

개별 patch: `profile-107-batch2/2-declaration-slice.patch`. 파일과 DETAIL 줄:

- `packages/canard/schema-form/src/core/blueprint/DETAIL.md`: DETAIL 5줄
- `packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts`
- `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.owned-inline-declaration-copies.test.ts`

### 3-object-assembly — 채택

측정 기반 source tree: `ecf2d60e45e154da59a69cda23edd0f8cbf3506ebf0b9f1e5e6d4e90e2d320b9`; 후보: `9da01f7d566e94aed2c1e1e44f30faf0d33c5b01b9a863fee1f270a260a0dcc5`. 이전 채택분만 기반에 포함했습니다.

local/extras/propertyKeys 없음과 entries/children 길이·순서·이름 동치를 확인하며 classic loop 한 번에서 실제 결과·names·stable shape·키 수를 생산합니다. 적격 호출의 Map/Set 두 객체와 원소 저장·중복 조회를 없앴고 기존 결과와 보유 stable shape는 유지합니다. 불일치 도중의 일시 결과·names는 보유하지 않습니다.

올바른 constructor spy에서 변경 전 Map 1회로 기대 0에 실패했고 변경 후 Map/Set 모두 0회입니다. undefined·__proto__·같은 값 참조·선언/선호/extras fallback 키 순서 및 기존 차등·소유 시험을 포함하여 개발·운영 각 23건 통과했습니다.

| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| nested-d5-f4 마운트 | 0.065958 | [0.051626, 0.080583] | -0.029584 | 4.832957 | 0.024165 | 개선 |
| flat-500 마운트 | 0.071000 | [0.064584, 0.076000] | -0.000126 | 1.600334 | 0.008002 | 개선 |
| oneOf-20 마운트 | 0.003709 | [-0.002875, 0.010708] | -0.000708 | 2.082584 | 0.010413 | 채택 조건 미충족 |
| sample-0 마운트 | 0.001417 | [0.000583, 0.002249] | -0.000541 | 0.098875 | 0.000494 | 개선 |
| sample-0 첫 갱신 | -0.000334 | [-0.001125, 0.000293] | 0.000167 | 0.083999 | 0.000420 | 채택 조건 미충족 |
| sample-0 후속 갱신 | -0.000208 | [-0.000876, 0.000541] | 0.000417 | 0.080042 | 0.000400 | 채택 조건 미충족 |
| nested-d5-f4 첫 갱신 | 0.014251 | [-0.071166, 0.072251] | 0.040500 | 0.185042 | 0.000925 | 채택 조건 미충족 |
| nested-d5-f4 후속 갱신 | 0.000875 | [0.000000, 0.001667] | 0.000083 | 0.111126 | 0.000556 | 개선 |
| oneOf-40 첫 갱신 | 0.004834 | [-0.000709, 0.008876] | 0.007791 | 1.464958 | 0.007325 | 채택 조건 미충족 |
| oneOf-40 후속 갱신 | 0.011083 | [0.007791, 0.013875] | 0.009501 | 0.960624 | 0.004803 | 개선 |

개별 patch: `profile-107-batch2/3-object-assembly.patch`. 파일과 DETAIL 줄:

- `packages/canard/schema-form/src/core/behaviors/objectBehavior/DETAIL.md`: DETAIL 5, 32줄
- `packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts`
- `packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.first-work.test.ts`

### 4-default-choices — 채택

측정 기반 source tree: `9da01f7d566e94aed2c1e1e44f30faf0d33c5b01b9a863fee1f270a260a0dcc5`; 후보: `d4aacce404d06fcb00e700807f5cc999c1284d604f4fd6f1fceae6d9ca624a86`. 이전 채택분만 기반에 포함했습니다.

options가 없으면 생성 때 동결한 동일 기본 choices에 연결하며 effective별 WeakMap 조회·등록을 유지합니다. 네 필드 choices 생산·freeze를 effective마다 없애고 모듈 상수 하나를 보유합니다. propertyKeys 해석과 사용자 배열의 독립 복사·동결은 유지합니다. schema 결과를 폼 사이에서 공유하지 않습니다.

변경 전 optionless 두 effective의 freeze 2회로 기대 0에 실패했고 변경 후 0회입니다. 기본값의 같은 참조·생성 지점 동결과 옵션/propertyKeys 독립성을 확인했으며 개발·운영 각 25건 통과했습니다. 변경 전 mount choices 객체/동결 계수는 nested 1,365·flat 501·oneOf 5·sample 3회였고 제거 후 distinct 전체 동결 수는 운영/개발 각각 1,706/29,007·502/10,523·111/1,564·5/66입니다. 재동결·primitive 호출은 0이며 소속 배열 보호는 그대로입니다.

| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| nested-d5-f4 마운트 | 0.023124 | [0.009625, 0.037834] | -0.029584 | 4.749251 | 0.023746 | 개선 |
| flat-500 마운트 | 0.022583 | [0.017708, 0.028208] | -0.000126 | 1.517166 | 0.007586 | 개선 |
| oneOf-20 마운트 | 0.004375 | [-0.004500, 0.009000] | -0.000708 | 2.083166 | 0.010416 | 채택 조건 미충족 |
| sample-0 마운트 | -0.000042 | [-0.000874, 0.001000] | -0.000541 | 0.097417 | 0.000487 | 채택 조건 미충족 |
| sample-0 첫 갱신 | 0.000458 | [-0.000167, 0.001042] | 0.000167 | 0.084584 | 0.000423 | 채택 조건 미충족 |
| sample-0 후속 갱신 | -0.000084 | [-0.000625, 0.000625] | 0.000417 | 0.080459 | 0.000402 | 채택 조건 미충족 |
| nested-d5-f4 첫 갱신 | 0.039084 | [-0.070500, 0.072833] | 0.040500 | 0.184084 | 0.000920 | 채택 조건 미충족 |
| nested-d5-f4 후속 갱신 | 0.000958 | [0.000251, 0.001791] | 0.000083 | 0.108999 | 0.000545 | 개선 |
| oneOf-40 첫 갱신 | 0.007083 | [-0.000166, 0.011209] | 0.007791 | 1.477375 | 0.007387 | 채택 조건 미충족 |
| oneOf-40 후속 갱신 | 0.010875 | [0.007166, 0.014041] | 0.009501 | 0.958708 | 0.004794 | 개선 |

개별 patch: `profile-107-batch2/4-default-choices.patch`. 파일과 DETAIL 줄:

- `packages/canard/schema-form/src/core/behaviors/DETAIL.md`: DETAIL 5, 37줄
- `packages/canard/schema-form/src/core/behaviors/utils/options/getStaticChoices.ts`
- `packages/canard/schema-form/src/core/blueprint/DETAIL.md`: DETAIL 85줄
- `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.owned-inline-counts.test.ts`
- `packages/canard/schema-form/src/core/behaviors/utils/options/__tests__/getStaticChoices.default-work.test.ts`

### 종단 검증과 실행 검사

측정 프로세스 450개, EOF로 닫힌 build service 10개, 행별 명령 50개, paired 표본 45,450개입니다. 최대 측정 worker 3939 ms, 최대 행별 명령 26473 ms이며 모두 순차·자연 종료했습니다. A/A가 먼저였고 누적 source tree·최종 source bytes·각 patch 기반과 최종 파일이 일치합니다. 번들·소스맵·instrumented copy·optimizer cache는 지정한 외부 bundles에만 두고 cacheDir을 설정하지 않았습니다. 설치와 git 쓰기는 하지 않았습니다.

| 패키지 명령 | 결과 | 자연 종료 ms |
| --- | --- | ---: |
| `npx --no-install vitest run --reporter=dot --configLoader runner --cache false --maxWorkers=1 --no-file-parallelism --project unit --project render --project react18` | 허용 EVENT-070 4건만 실패; ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯; Test Files  2 failed | 444 passed (446); Tests  4 failed | 3255 passed | 1 todo (3260) | 302402 |
| `npx --no-install vitest run --reporter=dot --configLoader runner --cache false --maxWorkers=1 --no-file-parallelism --project production` | 통과; Test Files  9 passed (9); Tests  20 passed (20) | 7083 |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 통과 | 8375 |
| `npx --no-install eslint src/**/*.{ts,tsx}` | 통과 | 6140 |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 통과; LEGACY_ISOLATED: 1654 files checked | 421 |

Vitest는 설정 산출물과 결과 cache를 저장하지 않도록 runner·cache=false를 사용했고 기존 외부 optimizer symlink를 유지했습니다. production에서는 설정 로드 전에 NODE_ENV=production을 지정했습니다. typecheck에서 시험 spy의 불필요한 MapConstructor/SetConstructor 캐스트를 제거했으며 전후 emitted JavaScript가 바이트 동일함을 확인하여 전체 개발 검증을 재사용했습니다. 이후 같은 tsc 명령은 통과했습니다. lint의 Node 폐기 예정 경고는 오류가 아니며 legacy guard는 1,654개 파일을 검사했습니다.

Step A·측정 순서/통계·기각 복원/patch chain·요청 명령의 결과는 `census-audit.json`, `measurements-audit.json`, `patches-audit.json`, `check-*.json`에서 검사합니다. 모든 profile-107-batch2 파일은 각각 5 MB 이하입니다. 제품 시험은 런타임 값·참조·동결·키 순서·작업 수만 관측하며 제품 source text를 읽거나 파싱하지 않습니다. 감사 도구의 source hash 비교는 측정 대상/patch 파일 동일성을 검증합니다.

STOP: S01의 폼 간 유효 schema 결과 공유·새 정착 설계는 이 작업에서 제외하고 소유자에게 남겼습니다. 추가 STOP 항목은 없습니다.
