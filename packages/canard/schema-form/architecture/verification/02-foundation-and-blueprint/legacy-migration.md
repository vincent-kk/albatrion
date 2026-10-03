# 02 레거시 보존 이동과 잎 교차 호환 검증

LANDING-159·205에 따라 이번 단계에서 새로 쓰는 전처리·allOf 병합 영역만 보존 이동했습니다. 새 경계 계약은 코드 이동 전에 `4d59285ac`에 커밋되었습니다.

## 정확한 이동 범위

[legacy-migration-files.json](./legacy-migration-files.json)에 기존/새 주소 80쌍을 기록했습니다. 모든 대상은 `src/` 아래 원래 상대 경로를 유지한 `src/__legacy__/` 주소입니다.

- `helpers/jsonSchema/preprocessSchema/` 전체
- `helpers/jsonSchema/processAllOfSchema/` 전체
- 부모 `helpers/jsonSchema/__tests__/`의 preprocessSchema 3파일과 processAllOfSchema 2파일

총 80파일 가운데 16파일은 기존 INTENT·DETAIL입니다. native `git mv`로 이동하고, 목적지에 앞서 승인·커밋된 계약 내용을 보존했습니다. 사후 확인에서 **원래 주소에 남은 파일 0, 빠진 목적지 0**입니다. 원본 파일을 삭제하여 버리지 않았습니다.

live `helpers/jsonSchema` 진입점의 두 재수출을 제거했습니다. `Form.tsx`는 legacy preprocessSchema 진입점, `schemaNodeFactory.ts`는 legacy processAllOfSchema 진입점으로 주소만 바꿨습니다. Form의 전처리 시점·호출·공개 엔진은 그대로입니다. getResolveSchema·isNullBranch·extractSchemaInfo·stripSchemaExtensions와 노드 팩토리 본체는 옮기지 않았습니다.

이동한 트리 내부 상대 import는 모두 유지했고 해석되지 않는 상대 import는 없었습니다. 따라서 별도의 상대 import 수선은 필요하지 않았습니다. 이동 후에도 살아 있는 `isNullBranch`·`extractSchemaInfo` 독립 모듈을 가리키는 기존 별칭은 유지했습니다.

## 호환 어댑터

legacy의 intersectEnum·intersectConst·intersectMinimum·intersectMaximum·intersectMultipleOf·validateRange 여섯 함수는 새 `helpers/schemaIntersection` 진입점을 사용합니다. 공집합 데이터는 기존 `EMPTY_ENUM_INTERSECTION`·`CONFLICTING_CONST_VALUES`·`INVALID_RANGE` JSONSchemaError와 기존 메시지로 바꿉니다. enum의 shallow/deep 선택, 한쪽 제약 부재의 반환, 수치 교차의 기존 의미를 유지합니다.

const만 LANDING-061의 결함 수정에 따라 깊은 비교로 바뀝니다. 구조적으로 같은 객체/배열은 앞 참조를 반환하고 다른 잎 값은 기존 오류를 던집니다. intersectPattern은 legacy 소유 트리와 함께 보존 이동했으며 **기존 구현과 바이트 단위로 동일**합니다. 새 잎 교차 모듈로 옮기거나 정규식 동작을 변경하지 않았습니다.

HEAD 원본과 새 주소의 80파일을 비교했을 때 이동 외 변경은 여섯 어댑터, const 시험 한 파일, 앞서 승인된 교차 계약 DETAIL 한 파일뿐이었습니다.

## 시험과 타입·린트

이동 전 기준선:

```sh
yarn workspace @canard/schema-form test --run --project unit helpers/jsonSchema
```

결과: 31파일, **571시험 통과**, exit 0.

const의 객체/배열 기대를 현행 원장대로 바꾸고 중첩 구조 사례를 더한 뒤, 옛 구현에서 먼저 실행했습니다.

```sh
yarn workspace @canard/schema-form test --run --project unit processAllOfSchema/intersectSchema/utils/__tests__/intersectConst.test.ts
```

결과: **3실패·7통과**, exit 1. 세 실패 모두 구조적으로 같은 별도 참조에서 실제 `CONFLICTING_CONST_VALUES`가 발생한 것이며 import/하니스 실패가 아니었습니다.

이동과 어댑터 적용 뒤 기준선과 같은 `helpers/jsonSchema` 명령은 legacy 경로를 포함하여 **31파일·572시험 통과**, exit 0(2.01초)입니다. 이동된 시험의 TypeScript AST 호출을 전후 대조한 결과 419→420개였고 차이는 원장에 따른 const 두 시험의 기대 변경과 중첩 const 한 시험 추가뿐이었습니다. 다른 시험의 입력·단언·이름을 유지했습니다.

```sh
yarn workspace @canard/schema-form exec eslint src/__legacy__/helpers/jsonSchema src/components/Form/Form.tsx src/core/nodes/schemaNodeFactory.ts src/helpers/jsonSchema/index.ts --format json
yarn workspace @canard/schema-form typecheck
```

대상 ESLint: **오류 0·경고 0**, exit 0. 타입 검사에서 어댑터의 부재 인자를 formatter로 보내는 두 narrowing 오류를 찾아 부재 조건을 명시한 뒤 해결했습니다. 마지막 패키지 타입 검사에는 이 이동 경로 오류가 없고, 병행 작업 중인 기존 BooleanNode·NumberNode·StringNode의 nullable 생성자 타입 TS2345 세 건만 남아 exit 2였습니다. 통합 타입 게이트 통과는 별도 확인해야 합니다.

## 새 코드의 레거시 import 금지

패키지 ESLint 설정에 blueprint와 schemaIntersection 경로의 `no-restricted-imports`를 추가했습니다. 기존 설정·친구 영역 `no-restricted-syntax` 규칙을 덮어쓰지 않았습니다. 별칭과 상대 주소 모두의 `__legacy__` 구간을 막습니다.

실제 패키지 ESLint CLI에 stdin으로 임시 코드를 주고 `--stdin-filename src/core/blueprint/__tests__/legacyBoundaryProbe.ts --format json`으로 검사했습니다. 파일은 생성하지 않았습니다.

| 입력 경로 | 규칙 적용 전 | 적용 후 |
| --- | --- | --- |
| `@/schema-form/__legacy__/helpers/jsonSchema/preprocessSchema` | exit 0, 잘못 허용 | exit 1, no-restricted-imports |
| `../../../__legacy__/helpers/jsonSchema/preprocessSchema` | exit 0, 잘못 허용 | exit 1, no-restricted-imports |
| `@/schema-form/helpers/schemaIntersection` | — | exit 0, 허용 |

이 검사는 정적 import/re-export 경계를 증명합니다. 제품 번들 전체의 간접 의존 DAG는 PR 경계 filid 검증에 포함됩니다. 전체 filid 스캔은 여기서 실행하지 않았습니다.

## 커밋 범위와 남은 통합 확인

커밋 대상은 manifest의 이동 전후 주소, live helpers/jsonSchema/index.ts, Form.tsx, schemaNodeFactory.ts, 패키지 eslint.config.js, 이 보고서와 manifest입니다. 생성된 dist·빌드 결과는 포함하지 않습니다.

이동 대상의 기존 큰 시험 파일과 기존 FCA 문서 형식을 일괄 정리하지 않았습니다. 원래 상대 경로와 회귀 기록을 보존했으며 PR 경계 스캔의 기존 발견과 새 발견을 구분해야 합니다. 전체 기존 unit/render/storybook 시험, strict 타입, 실제 경계 스캔은 02의 통합 게이트로 남아 있습니다.
