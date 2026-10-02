# 07 전환 — 렌더 시험 처분표

레거시 시험 157파일 2311건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 <Form> 렌더 사례 14건은 아래 행으로 처분.

레거시 집계는 U8 삭제 전 `ff549bfb7`의 `src/__legacy__/**/*.{test,spec}.{ts,tsx}`를 대상으로 아래 선언 호출 기준을 적용했습니다. 75C-01의 공개 Form 시험 2파일·14건을 삭제한 뒤 보존되는 레거시 시험은 155파일·2297건입니다.

## 전환 직전 기준

전환 직전 커밋: `3911b7591` (`feat/schema-form-switch`, 2026-10-02). 아래 셈은 이 워크트리의 현재 파일을 기준으로 합니다. 표의 파일 경로는 `packages/canard/schema-form` 기준 상대 경로입니다.

`vite.config.ts`의 `renderTests`에 포함되는 `src/**/*.test.tsx`와 `src/**/helpers/virtualization/__tests__/VirtualizationManager.test.ts`를 세며, `src/__legacy__/**`는 제외합니다. 현재 해당 DOM 의존 `.test.ts`는 1파일입니다. `architecture/spikes/**`, `.spec.ts`, 하니스·픽스처 자체는 포함하지 않습니다.

| 범위 | 파일 수 | 건수 |
| --- | --- | --- |
| `src` 전체의 비레거시 `render` 시험 | 52 | 521 |
| 그중 `src/__tests__` | 47 | 444 |
| `src/__tests__` 밖 | 5 | 77 |

건수는 줄 시작의 공백 뒤에 오는 `it(`·`test(` 선언 호출 지점 수입니다. `it.fails`, `it.each`와 같은 수식자 호출도 포함하며, `it.each`의 데이터 행과 `describe.each`·반복문의 실행 횟수는 펼치지 않고 각 선언을 1건으로 셉니다. 주석·문자열 속 설명, 정규식의 `.test(` 호출은 세지 않습니다. 따라서 실행 시 펼쳐지는 Vitest 사례 수나 통과 건수를 뜻하지 않습니다.

파일·건수와 커밋을 집계할 때 실제 실행한 셸 명령은 다음과 같습니다. Python 안의 `rg` 호출이 파일을 고르고, 정규식이 호출 지점을 셉니다.

```sh
cd /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07
git -C /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07 rev-parse --short HEAD
python3 - <<'PY'
from pathlib import Path
import re
import subprocess

pkg = Path('packages/canard/schema-form')
files = sorted(subprocess.check_output([
    'rg', '--files', 'src',
    '-g', '*.test.tsx',
    '-g', '*/helpers/virtualization/__tests__/VirtualizationManager.test.ts',
    '-g', '!src/__legacy__/**',
], cwd=pkg, text=True).splitlines())
case = re.compile(
    r'^\s*(?:it|test)(?:\.(?:fails|each|skip|only|todo|concurrent|sequential))*\s*\(',
    re.MULTILINE,
)
rows = [(file, len(case.findall((pkg / file).read_text()))) for file in files]
for file, count in rows:
    print(f'{file}\t{count}')
print(f'src 전체: {len(rows)}파일 / {sum(count for _, count in rows)}건')
nested = [(file, count) for file, count in rows if file.startswith('src/__tests__/')]
print(f'src/__tests__: {len(nested)}파일 / {sum(count for _, count in nested)}건')
other = [(file, count) for file, count in rows if not file.startswith('src/__tests__/')]
print(f'src/__tests__ 밖: {len(other)}파일 / {sum(count for _, count in other)}건')
PY
```

[68C-01](../../reviews/round-68-closing.md)의 결정대로 원장의 438·447건은 설계 시점의 수입니다. 오늘의 `src/__tests__` 444건은 각각 +6·−3건이며, 68C-01에 인용된 전체 53파일과 달리 현재 `renderTests`의 비레거시 대상은 52파일입니다. 이 차이는 `plan/07-switch/log.md`에도 한 줄로 기록합니다. `ledger/test.md`의 TEST-005·TEST-021·TEST-023은 고치지 않습니다.

## 처분과 TEST-005 판정 기준

처분의 정본은 [09 §4.3](../../_archive/2026-09-29/09-landing-and-test-strategy.md#43-기존-234파일의-처분)이며, 현행 [설계서 07 §2.3](../../design/07-landing-and-tests.md#23-기존-시험과-렌더-하니스의-처분)의 표와 [이주 원장](../../ledger/landing.md)의 `LANDING-nnn 이주...` 행을 함께 대조합니다. [시험 원장](../../ledger/test.md)의 TEST-021은 공통 `renderForm` 하니스의 수정 계약, TEST-023은 부류별 e2e와 소비자 전용 추가 단언의 자리 계약입니다.

- **그대로 산다**: 구형 엔진의 바뀌는 기대값·이름·정착 타이머에 의존하지 않습니다. 이미 새 엔진으로 검증하는 훅과 엔진을 구조적으로 주입받는 하니스 연결 시험은 같은 파일에서 유지합니다.
- **표면만 고친다**: 각 단언의 기대값은 새 규칙에서도 유지되며, 스키마·형·등록 키의 이름과 TEST-021의 공통 하니스 연결을 맞춥니다. `flush()` 뒤의 최종 값만 확인하는 사례는 정착 전 중간값을 단언하는 사례와 구별합니다.
- **버리고 새로 쓴다**: 바뀌는 기대값, 삭제되는 내부, 분기 자동 감지, 복원·전체 리마운트·옛 정착 타이밍 등에 의존합니다. 파일에 이런 단언이 하나라도 있으면 파일 전체를 이 처분으로 두고, 상황 목록과 여전히 유효한 관찰 항목을 새 시나리오로 옮깁니다.

**TEST-005의 셈 기준**은 위에서 `표면만 고친다`로 판정한 파일 중, 그 파일이 작성한 스키마·주입 정의·실제 소비하는 이름에 다음 두 가지가 모두 없는 것입니다.

1. `oneOf`·`anyOf`·스키마 `if/then/else`·`allOf`의 조합 및 옛 분기 자동 감지에 의존하는 사례입니다. 일반 JavaScript `if` 문은 스키마 조합으로 세지 않습니다.
2. 이주 행이 옮기거나 이름을 바꾼 옛 키·표면입니다. 예를 들어 `computed`·평면 `&키`, 맨 `terminal`·`virtual`·`propertyKeys`, `presentation.*`로 옮기는 스키마 `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages` 및 플러그인 자유 키, `node.group`, `normalizedValue`, `JSONSchemaError`, `CustomFormTypeRenderer`, 옛 플러그인 렌더러 등록 키, `NodeState`·`NodeEventType`, `findAll`, 제거되는 선택 API·옵션·`node.key`·`node.schemaPath`가 해당합니다.

주석이나 사례 제목에 남은 이름만으로 제외하지 않습니다. `properties.active`처럼 사용자가 지은 필드 이름, 이름이 유지되는 공개 형 `FormTypeInputProps`, JSX의 `Form.Input`·`Form.Render`와 그 `FormTypeInput` prop도 옛 스키마 키와 구별합니다(LANDING-035). 공통 `renderForm.tsx`의 옛 구현을 모든 파일에 중복 귀속하지 않으며, 그 수정은 TEST-021로 다룹니다.

이 기준의 현재 TEST-005 대상은 **4파일·24건**입니다. 원문의 17은 고정 목표로 맞추지 않습니다. 대표로 적혔던 `array.mutation-identity`·`controlled-interaction`·`default-value`는 현재 각각 배열 identity·trim·minItems 단언의 의미 변경에 걸립니다. `formType-resolution`·`state-management`·`validation.errors`는 기대값을 살릴 수 있어도 현재 파일에 옛 키·이름이 있어 TEST-005에서는 제외합니다.

`새 자리`는 U9의 인수 계획입니다. U8은 재작성 대상 파일을 삭제하고 아래 까닭 칸에 보존할 상황을 기록했습니다. 표면 수정 중 계약 충돌이나 선행 구현 불일치가 확인된 파일은 원문을 유지하며 결과를 [U8 보고서](./u8-disposition-report.md)에 적습니다. TEST-005의 기존 파일은 전환 때 표면을 맞추고, 스키마·단계는 공유 데이터로 옮기며 살아 있는 단언을 표시된 e2e 부류의 추가 단언으로 잇습니다. 그 밖의 표면 수정 파일은 같은 파일에서 이름을 맞춥니다. e2e 부류는 `packages/aileron/schema-form-scenarios/src/{value,settle,fill,exit,union,derive,controls,array,notify,validation}/`에 맞춥니다. 소비자 spy·StrictMode·첨부 파일 맵·IO 계측이 필요한 재작성은 전용 파일을 지정합니다. 여러 원본 파일을 같은 부류로 합친다는 뜻이며, 건수는 원본의 수입니다. 새 실행기는 TEST-023의 파일당 15건 상한을 별도로 지켜야 합니다.

## 파일별 처분

| 파일 | 건수 | 처분 | 까닭 | TEST-005 17파일 | 새 자리 |
| --- | --- | --- | --- | --- | --- |
| `src/__tests__/harness.smoke.test.tsx` | 9 | 표면만 고친다 | 기본 DOM·값·배열 조작·검증·StrictMode 관찰은 유지됩니다. 두 단계 사례도 중간 빈 값을 단언하지 않으므로 TEST-021의 하니스 연결과 초기 정착 설명을 맞추면 됩니다. | 해당: 조합·옛 키 없음 | e2e 추가 단언: `src/__tests__/e2e/settle.test.tsx` |
| `src/__tests__/scenarioHarness.render.test.tsx` | 1 | 그대로 산다 | 구조적 `ScenarioForm` 주입·핸들 등록·`playScenario` 연결만 확인하며, reset 뒤 최종 값의 기대는 유지됩니다. 구형 트리 재생성·타이머·이름을 단언하지 않습니다(TEST-023). | 비해당: 그대로 유지 | 같은 파일 |
| `src/__tests__/scenarios/array.mutation-identity.render.test.tsx` | 12 | 버리고 새로 쓴다 | 재정렬 때 모든 행의 mount ordinal 증가와 기존 초점 소실을 단언합니다. 새 배열 통째 쓰기는 위치로 노드를 잇고 바뀐 원본의 입력만 Refresh합니다(LANDING-164·199·202). U9 보존: 배열 추가·삭제·재정렬, 값과 초점, 안정 itemKey. | 비해당: 기대값 변경 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/array.omit-trailing.composite.render.test.tsx` | 9 | 버리고 새로 쓴다 | 분기 복원·required 자동 활성과 주입의 원시 배열 복사를 함께 단언합니다. 분기·채움 및 주입이 읽는 투영값 기준으로 재구성해야 합니다(LANDING-004·011·027·032, LANDING-023). U9 보존: 분기와 omitTrailing 결합, 출력 기반 주입, 오류 인덱스. | 비해당: 조합·옛 computed 및 의미 변경 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/array.omit-trailing.conditional.render.test.tsx` | 9 | 버리고 새로 쓴다 | 분기 왕복 때 minItems 입력 복원과 then.required 기반 활성에 의존합니다. 명시 활성·원본 유지·입력 컴포넌트의 제약으로 다시 씁니다(LANDING-018·027·032·116). U9 보존: 조건 왕복과 배열 출력, 사용자 입력 보존. | 비해당: 조합·옛 제어 키 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/array.omit-trailing.injection.render.test.tsx` | 10 | 표면만 고친다 | setValue·defaultValue·reset·nullable·StrictMode 뒤의 잘린 방출값과 입력 존재만 확인합니다. 노드 교체 횟수나 재채움은 단언하지 않으며, 맨 terminal을 options.terminal로 옮기면 기대를 유지합니다(LANDING-034·039·164). | 비해당: 맨 terminal 사용 | 같은 파일(이름만) |
| `src/__tests__/scenarios/array.omit-trailing.render.test.tsx` | 12 | 버리고 새로 쓴다 | minItems만으로 빈 행이 생긴다는 초기 조건을 포함합니다. omitTrailing의 출력·오류 인덱스 자산은 살리되, 채움 책임이 입력 컴포넌트로 옮겨지는 새 상황으로 다시 씁니다(LANDING-116). U9 보존: 후행 undefined 생략, 내부 빈칸, 검증 경로. | 비해당: 옛 채움 전제 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/array.prefixItems-terminal.render.test.tsx` | 14 | 버리고 새로 쓴다 | minItems로 튜플 슬롯을 생성하고 터미널 배열에 위치 기본값을 채우는 전제를 단언합니다. 제약·채움 책임과 prefixItems 상황을 새 배열 데이터로 다시 짭니다(LANDING-116·149·165). U9 보존: prefixItems 위치 스키마, 터미널 배열 값, 외부 기본값. | 비해당: 맨 terminal 및 옛 채움 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/composition.allOf-ifThenElse.render.test.tsx` | 12 | 버리고 새로 쓴다 | allOf 병합에 then.required 자동 활성과 꺼진 필드 처리가 섞여 있습니다. then.properties·controls.active와 새 유효 스키마 기준으로 다시 씁니다(LANDING-010·018·027·038). U9 보존: allOf 조건 병합, 활성 필드 DOM, required 검증. | 비해당: 조합·computed | `src/__tests__/e2e/settle.test.tsx` |
| `src/__tests__/scenarios/composition.anyOf.render.test.tsx` | 11 | 버리고 새로 쓴다 | 재활성 때 기본값 재주입 및 같은 키의 anyOf 분기를 무조건 기각하는 기대가 있습니다. 원본 유지·공유 노드·활성 조각 병합으로 대체합니다(LANDING-011·018·032·038). U9 보존: 복수 활성 anyOf, 공유 필드, 분기 왕복. | 비해당: 조합·computed 및 기대값 변경 | `src/__tests__/e2e/union.test.tsx` |
| `src/__tests__/scenarios/composition.nested-branch.render.test.tsx` | 9 | 버리고 새로 쓴다 | 외부 분기 왕복의 locked-reset 재priming과 내부 입력 재생성에 의존합니다. 명시 활성과 기존 노드의 원본 유지·공유를 단언해야 합니다(LANDING-004·011·018·032). U9 보존: 중첩 분기 전환, 외부·내부 활성과 값. | 비해당: 중첩 oneOf·computed | `src/__tests__/e2e/union.test.tsx` |
| `src/__tests__/scenarios/composition.oneOf.concurrentMount.render.test.tsx` | 4 | 버리고 새로 쓴다 | const/enum 자동 선택을 React.lazy·transition 재시도와 결합하고, 타이머 뒤 children 참조를 관찰합니다. 명시 판별식과 소비자 재시도 계측으로 바꿉니다(LANDING-004·022·038). U9 보존: lazy 재시도, transition 전환, 커밋된 자식 DOM. | 비해당: oneOf 자동 감지 | `src/__tests__/e2e/union-concurrent-mount.test.tsx` |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx` | 10 | 버리고 새로 쓴다 | const 자동 판별·분기 index와 2단계 priming을 섞어 확인합니다. 명시 discriminator/active와 생성 즉시 정착을 기준으로 다시 씁니다(LANDING-004·005·011, TEST-021). U9 보존: 첫 화면 분기 필드, 기본값과 DOM 일치. | 비해당: oneOf·옛 분기 키 | `src/__tests__/e2e/union.test.tsx` |
| `src/__tests__/scenarios/composition.oneOf.switch.render.test.tsx` | 12 | 버리고 새로 쓴다 | 분기 왕복 때 사용자 값을 비우고 기본값을 다시 넣는 기대가 있습니다. 원본 유지와 공유 노드를 기준으로 바꿉니다(LANDING-011·018·032). U9 보존: 분기 왕복, 사용자 입력과 비활성 출력 제외. | 비해당: oneOf·옛 분기 키 및 복원 의미 | `src/__tests__/e2e/exit.test.tsx` |
| `src/__tests__/scenarios/computed.derived.render.test.tsx` | 14 | 버리고 새로 쓴다 | 지연 cascade·active와 derived의 공동 의존·순환 실패 코드에 의존합니다. 에지 발화·개별 의존·커밋 후 오류와 예산을 새 단언으로 씁니다(LANDING-014·022·025·163). U9 보존: 파생 사슬, 의존 값 갱신, 순환·예산 오류 관찰. | 비해당: computed·&derived 및 정착 의미 | `src/__tests__/e2e/derive.test.tsx` |
| `src/__tests__/scenarios/computed.readonly-disabled.render.test.tsx` | 13 | 표면만 고친다 | 단순 의존 식의 최종 잠금·Form 속성 잠금·select의 disabled 관찰입니다. 표준 readOnly와 거짓 제어의 충돌 우선순위나 잠금 중 쓰기는 단언하지 않아 기대를 유지합니다. computed 이름만 맞춥니다(LANDING-007·012·015·016·168). | 비해당: computed 사용 | 같은 파일(이름만) |
| `src/__tests__/scenarios/computed.visibility.render.test.tsx` | 12 | 표면만 고친다 | visible의 숨김·값 유지와 active의 DOM·방출 제외를 확인합니다. 꺼진 노드의 원본 삭제·복원 자체는 단언하지 않습니다. computed·&visible·&active를 controls로 옮겨 최종 기대를 유지합니다(LANDING-007·018·033). | 비해당: computed·평면 &키 | 같은 파일(이름만) |
| `src/__tests__/scenarios/controlled-interaction.render.test.tsx` | 13 | 버리고 새로 쓴다 | trim 뒤 비제어 DOM에 공백이 남는다는 단언이 있습니다. 새 finishInput 자동 쓰기는 비제어 입력을 다시 마운트하므로 기대가 달라집니다(LANDING-145). U9 보존: 제어·비제어 입력, blur trim, focus·select. | 비해당: trim 기대값 변경 | `src/__tests__/e2e/controls.test.tsx` |
| `src/__tests__/scenarios/default-value.input-immutability.render.test.tsx` | 2 | 표면만 고친다 | 호출자의 defaultValue 불변성과 frozen 값 렌더는 유지됩니다. terminal·formType의 스키마 위치만 바꿉니다(LANDING-034). | 비해당: 맨 terminal·formType | 같은 파일(이름만) |
| `src/__tests__/scenarios/default-value.render.test.tsx` | 14 | 버리고 새로 쓴다 | minItems만으로 단일·중첩 배열을 자동 채우는 기대가 다수입니다. 새 채움과 입력 제약을 분리한 데이터로 옮깁니다(LANDING-116·144·202). U9 보존: 스키마·외부 기본값, 중첩 객체·배열, reset. | 비해당: 옛 minItems 자동 채움 | `src/__tests__/e2e/fill.test.tsx` |
| `src/__tests__/scenarios/deferred-mount.render.test.tsx` | 15 | 표면만 고친다 | placeholder·교차·idle·focus 재생·지연 필드의 최종 값과 오류를 관찰합니다. 분기 재진입 기본값 복원이나 전체 교체 identity 소실은 단언하지 않습니다. computed·&if를 명시 controls로 옮깁니다(LANDING-006·007·033, TEST-021). | 비해당: oneOf·옛 제어 키 | 같은 파일(이름만) |
| `src/__tests__/scenarios/deferred-mount.strict.render.test.tsx` | 3 | 표면만 고친다 | StrictMode의 관찰 등록 복구·idle 완료·focus 단일 재생은 유지됩니다. IO/idle 계측을 살리고 공통 하니스의 새 핸들·동기 정착 연결을 맞춥니다(TEST-021·023). | 해당: 조합·옛 키 없음 | e2e 추가 단언: `src/__tests__/e2e/settle.test.tsx` |
| `src/__tests__/scenarios/formType-resolution.render.test.tsx` | 13 | 표면만 고친다 | 입력 선택 우선순위·경로 매핑·사용자 레이아웃·오류 ReactNode 기대는 유지됩니다. 스키마 FormTypeInput을 presentation으로, CustomFormTypeRenderer·node.group을 새 이름으로 바꿉니다(LANDING-034·035·043). | 비해당: 옛 입력·렌더러 키·group | 같은 파일(이름만) |
| `src/__tests__/scenarios/injectTo.render.test.tsx` | 13 | 버리고 새로 쓴다 | 양방향 주입의 자동 순환 차단과 주입을 통한 옛 oneOf 선택을 단언합니다. 예산·명시 활성·동기 진입 기준으로 바꿉니다(LANDING-004·022·030). U9 보존: 형제·부모·배열 주입, 연쇄와 순환, 분기 활성. | 비해당: oneOf·&if 및 순환 차단 의미 | `src/__tests__/e2e/derive.test.tsx` |
| `src/__tests__/scenarios/multi-render-split-brain.render.test.tsx` | 10 | 표면만 고친다 | 여러 Form.Render와 분리된 Input/Error/Label의 최종 값·오류 일치를 확인합니다. 초기 중간 빈 값이나 분기 복원값은 단언하지 않습니다. &if를 controls.active로 옮기며 합성 Form API 이름은 유지합니다(LANDING-006·033·035). | 비해당: oneOf·&if | 같은 파일(이름만) |
| `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx` | 8 | 버리고 새로 쓴다 | null 아래 자식에 기본값을 보이고 승격 때 가져오며 defaultValue를 생성 시점 값으로 고정합니다. 새 null 자식·로드 스냅숏으로 바꿉니다(LANDING-139·155·200). U9 보존: null 객체 빈 화면, 자식 쓰기 승격, 로드 기본값. | 비해당: oneOf·&if 및 null 채움 의미 | `src/__tests__/e2e/value.test.tsx` |
| `src/__tests__/scenarios/nullable.object-initial-null.render.test.tsx` | 7 | 버리고 새로 쓴다 | null 객체의 사용자 쓰기에 형제 기본값이 함께 살아난다는 기대가 있습니다. 새 승격은 숨은 기본값을 재채움하지 않습니다(LANDING-139·200). U9 보존: 초기 null, 자식 사용자 입력, 형제 값. | 비해당: 조합·옛 null 승격 기대 | `src/__tests__/e2e/value.test.tsx` |
| `src/__tests__/scenarios/nullable.object-null-branch.render.test.tsx` | 8 | 버리고 새로 쓴다 | null 아래 kind 기본값으로 a 분기를 그리고 승격 때 kind를 포함한다는 기대가 있습니다. null 조상 아래 채움과 활성 판정을 새로 씁니다(LANDING-004·139·200). U9 보존: null 조상과 분기 필드, 활성 전환, 승격. | 비해당: oneOf/anyOf·&if 및 채움 의미 | `src/__tests__/e2e/union.test.tsx` |
| `src/__tests__/scenarios/nullable.object-pending-read-readers.render.test.tsx` | 6 | 버리고 새로 쓴다 | 옛 pending-read와 파생·주입 처리 도중의 부모 읽기 parity를 고정합니다. 커밋 읽기와 null 조상 주입·승격의 새 계약으로 바꿉니다(LANDING-014·146·166). U9 보존: 파생·주입 중 부모 읽기, 출력과 DOM 일치. | 비해당: computed·NodeEventType 및 옛 읽기 모델 | `src/__tests__/e2e/derive.test.tsx` |
| `src/__tests__/scenarios/nullable.object-pending-read.render.test.tsx` | 7 | 버리고 새로 쓴다 | pending-read 여부에 따른 watcher·inject parity와 null 아래 파생 값 승격을 검증합니다. 동기 정착·에지·null 조상 보존을 기준으로 재작성합니다(LANDING-014·139·146·166). U9 보존: watch·inject 관찰, null 조상 아래 쓰기. | 비해당: computed·NodeEventType 및 null 쓰기 모델 | `src/__tests__/e2e/derive.test.tsx` |
| `src/__tests__/scenarios/nullable.object-validation.render.test.tsx` | 2 | 표면만 고친다 | 보존된 null을 properties-only oneOf는 기각하고 anyOf는 허용한다는 표준 검증 기대입니다. 분기 선택이나 마커는 단언하지 않으므로 &if를 controls.active로 옮겨 기대를 살립니다(LANDING-006·033·115). | 비해당: oneOf/anyOf·&if | 같은 파일(이름만) |
| `src/__tests__/scenarios/nullable.object-write-provenance.render.test.tsx` | 2 | 버리고 새로 쓴다 | 사용자가 의존 값을 바꾸면 주입 대상의 null 객체만 생성된다고 단언합니다. 새 injectTo는 null 조상을 객체로 만들지 않습니다(LANDING-166). U9 보존: 입력·자동 쓰기 출처, null 조상 유지. | 비해당: computed 및 null 주입 기대 | `src/__tests__/e2e/derive.test.tsx` |
| `src/__tests__/scenarios/nullable.render.test.tsx` | 15 | 버리고 새로 쓴다 | nullable 문자열을 비우면 node.value가 빈 문자열이라는 단언이 있습니다. 기본 입력의 빈 값은 undefined로 바뀌며 null 자식·Merge 입력의 Refresh도 새 규칙을 따릅니다(LANDING-139·140·196). U9 보존: nullable 원시·객체·배열, 빈 입력과 null 구별. | 비해당: 기본 입력 빈 값 의미 변경 | `src/__tests__/e2e/value.test.tsx` |
| `src/__tests__/scenarios/override-props.render.test.tsx` | 2 | 표면만 고친다 | JSX Form.Input에서 override prop을 제거·교체할 때의 DOM 기대는 유지됩니다. Form.Input과 해당 FormTypeInput prop은 이름 변경 대상이 아니며 공통 하니스만 연결합니다(LANDING-035, TEST-021). | 해당: 조합·옛 키 없음 | e2e 추가 단언: `src/__tests__/e2e/value.test.tsx` |
| `src/__tests__/scenarios/refSchema-context-provider.render.test.tsx` | 13 | 표면만 고친다 | 안전한 배열 경유 재귀·$ref·context 전달과 명시 제어의 최종 DOM 기대를 유지합니다. 무제한 객체 재귀의 옛 오류는 단언하지 않으며 computed 및 스키마 입력 키만 옮깁니다(LANDING-007·034·128). | 비해당: computed·옛 스키마 입력 키 | 같은 파일(이름만) |
| `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx` | 11 | 버리고 새로 쓴다 | Refresh 없는 setValue 뒤 비제어 DOM을 낡게 두고 분기 왕복 때 기본값을 다시 넣는 기대가 있습니다. 새 Refresh 범위·원본 유지·입력 출처 규칙으로 바꿉니다(LANDING-021·032·042·199·201). U9 보존: 외부 setValue, 입력 Refresh, 분기 왕복 DOM. | 비해당: oneOf·&if·NodeEventType 및 Refresh 의미 | `src/__tests__/e2e/notify.test.tsx` |
| `src/__tests__/scenarios/renderProp.value.render.test.tsx` | 10 | 표면만 고친다 | 한 문자 쓰기의 렌더 1회, settle 뒤 getValue와 일치, 비함수 children 안정성을 확인합니다. 여러 쓰기의 옛 debounce 횟수나 reset의 노드 교체는 단언하지 않으므로 기대를 유지하고 하니스 설명을 맞춥니다(LANDING-022·039, TEST-021). | 해당: 조합·옛 키 없음 | e2e 추가 단언: `src/__tests__/e2e/notify.test.tsx` |
| `src/__tests__/scenarios/reset.pristine.render.test.tsx` | 14 | 표면만 고친다 | reset 뒤 기본값·상호작용 초기화와 터미널 입력 리마운트 기대는 유지됩니다. provider·브랜치 전체 리마운트나 트리 참조 교체는 단언하지 않습니다. NodeState·&if를 옮깁니다(LANDING-006·039·157, 설계서 07 §2.6). | 비해당: oneOf·&if·NodeState | 같은 파일(이름만) |
| `src/__tests__/scenarios/schema-props-renderer.render.test.tsx` | 12 | 버리고 새로 쓴다 | 빈 입력에도 omitEmpty:false 문자열·수 키가 남는다고 단언합니다. 기본 입력이 undefined를 쓰는 새 계약은 단순 presentation 이름 교체를 넘습니다(LANDING-034·125·196). U9 보존: presentation props 전달, 사용자 렌더러, 입력 값. | 비해당: 옛 표현 키 및 빈 입력 기대 | `src/__tests__/e2e/controls.test.tsx` |
| `src/__tests__/scenarios/state-management.render.test.tsx` | 14 | 표면만 고친다 | Dirty·Touched·ShowError·하위 상태 초기화와 값 유지의 기대는 같습니다. 비불리언 전역 상태나 마지막 참인 노드가 사라지는 옛 집계는 단언하지 않습니다. 상태·이벤트·렌더러·메시지 이름을 맞춥니다(LANDING-034·035·152·153·157·158). | 비해당: NodeState·NodeEventType·옛 렌더러/메시지 키 | 같은 파일(이름만) |
| `src/__tests__/scenarios/terminal-mode.render.test.tsx` | 15 | 버리고 새로 쓴다 | 터미널 배열의 minItems 채움·undefined 교체 비움과 객체 기본값 조립에 의존합니다. options 이동만으로 해결되지 않으며 새 터미널 동작·채움·로드로 다시 씁니다(LANDING-116·142·144·149). U9 보존: 터미널 객체·배열, 전체 값 입력, reset. | 비해당: 맨 terminal·formType·propertyKeys 및 채움 의미 | `src/__tests__/e2e/array.test.tsx` |
| `src/__tests__/scenarios/union.migration-shapes.render.test.tsx` | 3 | 버리고 새로 쓴다 | 청사진의 새 수용과 함께 현재 Form의 UNKNOWN_JSON_SCHEMA·null 핸들·대체 화면을 기대합니다. 새 Form 성공 및 RECURSIVE_SHAPE_UNBOUNDED 보고로 대체합니다(LANDING-207·208·044·046). U9 보존: 형 없는 객체 분기, 리터럴 필드, 재귀 오류 화면. | 비해당: 조합 및 옛 엔진 거부 기대 | `src/__tests__/e2e/union.test.tsx` |
| `src/__tests__/scenarios/upload-file.render.test.tsx` | 9 | 버리고 새로 쓴다 | 분기 이탈 뒤 find로 얻은 옛 비활성 노드의 enabled=false를 확인하며 첨부 파일 맵 수명도 계측합니다. 새 find는 비활성 변형에 null을 돌려주므로, 맵·늦은 첨부 spy를 전용 파일로 옮깁니다(LANDING-032·148, TEST-023). U9 보존: 단일·다중 첨부, 분기 이탈 정리, 늦은 첨부 폐기. | 비해당: oneOf·&if·옛 입력 키 및 비활성 find | `src/__tests__/e2e/upload-file.test.tsx` |
| `src/__tests__/scenarios/validation.async-race.render.test.tsx` | 2 | 표면만 고친다 | 인위적 검증기 지연으로 요청의 최신 세대가 이긴다는 최종 값·오류만 단언합니다. 엔진 debounce 횟수는 단언하지 않습니다. JSONSchemaError와 validatorFactory의 compile/compileGuard 연결을 맞춥니다(LANDING-024·036·037). | 비해당: JSONSchemaError·옛 validatorFactory 형 | 같은 파일(이름만) |
| `src/__tests__/scenarios/validation.branch-marker.render.test.tsx` | 2 | 버리고 새로 쓴다 | 옛 마커가 조건 분기를 검증 스키마에 반영한다는 전제로 required·maxItems 오류 목록을 고정합니다. 마커 없는 입력과 활성 schemaPath 필터로 상황을 다시 검증합니다(LANDING-004·115). U9 보존: 활성 분기 required·maxItems, 비활성 오류 제외. | 비해당: oneOf·&if 및 폐기되는 마커 전제 | `src/__tests__/e2e/validation.test.tsx` |
| `src/__tests__/scenarios/validation.errors.render.test.tsx` | 14 | 표면만 고친다 | 유효성·외부 오류·명시 validate·submit의 최종 DOM·거부 기대를 유지합니다. OnRequest의 옛 마운트 검증 횟수는 단언하지 않습니다. errorMessages와 렌더러 등록 이름을 맞춥니다(LANDING-034·035·041). | 비해당: 맨 errorMessages·옛 FormError 등록 | 같은 파일(이름만) |
| `src/__tests__/scenarios/virtual.render.test.tsx` | 12 | 버리고 새로 쓴다 | 인라인 입력을 둔 가상의 자식을 비우는 기대와 undefined Overwrite 비움·활성 복원에 의존합니다. 새 가상은 branch로 ChildNodeComponents를 받고 새 로드를 따릅니다(LANDING-019·142·149·167). U9 보존: 가상 자식 DOM, 전체 값 쓰기, 활성 전환. | 비해당: 맨 virtual·computed·옛 입력 키 및 가상 전략 | `src/__tests__/e2e/controls.test.tsx` |
| `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx` | 23 | 버리고 새로 쓴다 | 구형 node/mock과 setValue·외부 오류 지움·Dirty의 분리된 호출을 계측합니다. 새 입력 진입은 batch와 출처·전체 잠금·늦은 쓰기 판정을 함께 확인해야 합니다(LANDING-021·042·168·201, TEST-023). U9 보존: 입력 값·dirty·외부 오류, 잠금, 늦은 쓰기. | 비해당: NodeState·옛 입력 내부 및 호출 모델 | `src/__tests__/e2e/schema-node-props-flow.test.tsx` |
| `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx` | 37 | 버리고 새로 쓴다 | 옛 이벤트 직접 publish·Refresh cascade·마이크로태스크 합침·조합 자동 처리를 섞어 고정합니다. 새 전달·입력 리마운트·구독 spy로 재작성하고 상황은 notify/union/derive/array 데이터로 옮깁니다(LANDING-004·021·022·042·158·199). U9 보존: 입력 Refresh·재마운트, 구독 통지, 조합·파생·배열 DOM. | 비해당: 조합·computed·NodeEventType 및 옛 이벤트 | `src/__tests__/e2e/proxy-refresh.test.tsx` |
| `src/helpers/virtualization/__tests__/VirtualizationManager.test.ts` | 13 | 그대로 산다 | 가상화 매니저는 전환 뒤에도 그대로 쓰는 것이고(LANDING-087 "가상화(WeakSet identity)"), 이 시험은 옛 엔진이 아니라 매니저의 IO·idle 백필·타이머 폴백을 직접 단언합니다. 조율자(07 작업자)가 판단 필요 행을 이 처분으로 닫았고, 전환 뒤 붉어지면 U8에서 다시 처분합니다. | 비해당: 그대로 유지 | 같은 파일 |
| `src/hooks/__tests__/useSchemaNodeSubscribe.test.tsx` | 2 | 그대로 산다 | createHookNode가 이미 새 청사진·SchemaNode 공장을 사용합니다. 동기 통지·onSubscribe 따라잡기·StrictMode의 한 구독과 cleanup 단언은 새 계약 그대로입니다(설계서 06 §1.2, REACT-006). | 비해당: 그대로 유지 | 같은 파일 |
| `src/hooks/__tests__/useSchemaNodeTracker.test.tsx` | 2 | 표면만 고친다 | 이미 새 노드를 써서 masked revision·동기 갱신·StrictMode 구독을 검증합니다. 남은 NodeEventType 참조를 SchemaNodeEventType으로 바꾸면 기대는 같습니다(LANDING-158, REACT-006). | 비해당: NodeEventType 사용 | 같은 파일(이름만) |

## 최종 집계

| 처분 | 파일 수 | 건수 | TEST-005 파일 수 |
| --- | --- | --- | --- |
| 그대로 산다 | 3 | 16 | 0 |
| 표면만 고친다 | 18 | 160 | 4 |
| 버리고 새로 쓴다 | 31 | 345 | 0 |
| 합계 | 52 | 521 | 4 |

| TEST-005 파일 | 건수 | 추가 단언의 새 자리 |
| --- | --- | --- |
| `src/__tests__/harness.smoke.test.tsx` | 9 | `src/__tests__/e2e/settle.test.tsx` |
| `src/__tests__/scenarios/deferred-mount.strict.render.test.tsx` | 3 | `src/__tests__/e2e/settle.test.tsx` |
| `src/__tests__/scenarios/override-props.render.test.tsx` | 2 | `src/__tests__/e2e/value.test.tsx` |
| `src/__tests__/scenarios/renderProp.value.render.test.tsx` | 10 | `src/__tests__/e2e/notify.test.tsx` |
| 합계 | 24 | 4파일이며 원장의 17은 그대로 둡니다. |

위 부류별 합계는 전환 직전 처분 결정입니다. U8 후속 실행에서 원장 충돌로 중단한 5파일은 원문을 보존했습니다. 상태 시험은 표면 복구로 통과했고, ref/context 시험은 표면 3건을 복구했으나 재귀 엔진 문제 1건이 남습니다. 기존 처분은 관리자 답 없이 바꾸지 않으며, 전체 실패별 분류·충돌 단언·원장 ID·실행 결과는 [U8 보고서](./u8-disposition-report.md)를 확인합니다.


## 레거시 공개 Form 사례의 새 자리 (73C-01·75C-01)

두 원본 파일은 이 행으로 인계한 뒤 U8에서 삭제합니다. nullable의 `type` 배열은 옛 키가 아니며, 조합이 없는 11건은 기대값을 그대로 보존합니다. 이주 점검표 LANDING-004·006·010·139·173·200과 대조했습니다. U9는 기존 시험의 try/catch로 단언 실패를 삼키지 않고 새 e2e의 실제 관찰로 검증합니다.

| 원본 파일과 시험 | 건수 | 처분 | 까닭 | 새 자리와 예정 시험 이름 |
| --- | --- | --- | --- | --- |
| `src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx` — `should update React state correctly when toggling adult <-> none` | 1 | 버리고 새로 쓴다 | 조합·옛 조건을 명시 활성으로 이주합니다(LANDING-004·006·010). 조건 전환과 nullable 관찰을 보존합니다. | `src/__tests__/e2e/settle.test.tsx` — `if-then-adult-roundtrip` |
| `src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx` — `should handle rapid toggles without state corruption` | 1 | 버리고 새로 쓴다 | 조합·옛 조건을 명시 활성으로 이주합니다(LANDING-004·006·010). 조건 전환과 nullable 관찰을 보존합니다. | `src/__tests__/e2e/settle.test.tsx` — `if-then-rapid-toggle` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle optional email and phone fields correctly` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-contact-fields` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle nullable price with min/max constraints` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-price-limits` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should distinguish null from false for boolean fields` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-boolean-null-false` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle nullable nested objects correctly` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-nested-address` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle arrays with nullable item schemas` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-array-items` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle nullable array type correctly` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-array-container` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle nullable fields in conditional schemas` | 1 | 버리고 새로 쓴다 | 조합·옛 조건을 명시 활성으로 이주합니다(LANDING-004·006·010). 조건 전환과 nullable 관찰을 보존합니다. | `src/__tests__/e2e/union.test.tsx` — `nullable-conditional-account` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle form with mix of required and nullable fields` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-required-mix` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should validate nullable fields with format constraints` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/validation.test.tsx` — `nullable-formats` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle deeply nested nullable objects and arrays` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-deep-structure` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle complete job application with nullable fields` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `nullable-job-application` |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` — `should handle pure null type field` | 1 | 표면만 고친다 | 조합·옛 키가 없습니다. type 배열·null 및 값 단언을 새 e2e에 유지합니다(TEST-005). | `src/__tests__/e2e/value.test.tsx` — `pure-null-field` |
