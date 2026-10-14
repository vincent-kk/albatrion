# 19라운드 원장 변경 통합 검증

정본 `reviews/round-19-closing.md` 19C-01·19C-02와 BLUEPRINT-048·049·050·051, NODE-059, LANDING-207·208, TEST-067·079를 직접 대조했습니다. 이 기록의 최종 통합 소스는 `a0d7c6dd6`이며, 원장·계획서는 검증자가 수정하지 않았습니다.

## 원장 대 구현 게이트

| 항목 | 확인한 결과 |
| --- | --- |
| BLUEPRINT-048·051, E16 | 게이트 없는 분기별 허용 집합을 `null` 포함 상태로 합집합하고 두 키워드는 교차한 뒤 fold합니다. E16은 object / `'object'` / false / NODE-028 전략 순서로 성공합니다. 배열 호스트, object+null, 중첩 형 없는 분기도 사례가 있습니다. |
| BLUEPRINT-038·048·050 | `controls.active`와 변환된 `controls.discriminator` 게이트 분기는 U에서 제외합니다. object+array와 ⊤ 분기는 오류이며, ⊤ 오류는 분기 `schemaPath`와 명시 `type` 안내를 보존합니다. 순환 `$ref` 기여는 절단하며 빈 U는 스택 넘침 대신 `UNKNOWN_JSON_SCHEMA`입니다. 분기 없는 단일 종류의 `const`·`enum`은 잎 또는 null 잎, 혼합·객체 리터럴 및 분기 안의 const 전용 칸은 오류입니다. |
| NODE-059 | `InferSchemaNode`는 모두 인라인인 동일 객체·배열 분기만 좁힙니다. `$ref`·게이트·두 키워드·호스트 `allOf`는 넓은 형을 유지합니다. `InferValueType`은 인라인 분기의 값 합, null, 분기 없는 리터럴을 보존합니다. 정적으로 무효인 혼합 컨테이너·리터럴은 node `never`, 값 `unknown`입니다. |
| TEST-067(b)·079 | `blueprint.corpus.test.ts`가 원본 `corpus.mjs`의 인덱스 0–13을 변형 없이 직접 분석하고 직렬화 전후 동일함을 단언합니다. 최종 전체 시험에서 14/14 수용했고, 동일 소스의 별도 측정도 14/14입니다. 불수용 표본은 없습니다. |
| LANDING-207·208 | `union.migration-shapes.render.test.tsx`는 인라인 객체 `oneOf`·`anyOf` 2건, Optional[Self] 1건, 형 없는 const·enum 프로퍼티 1건을 실행합니다. PR 02의 청사진에서는 새 호스트·원시 잎 및 `RECURSIVE_SHAPE_UNBOUNDED`를 단언하고, 아직 옛 엔진을 쓰는 공개 Form·factory에서는 `UNKNOWN_JSON_SCHEMA`와 오류 경계 렌더링을 단언합니다. 새 Form의 성공 렌더링은 엔진 전환 PR 범위입니다. |
| TEST-067(c) | 자기 참조·nullable 자기 참조·A↔B 상호 참조의 무한 형상 오류와 배열·게이트·터미널 절단의 유한 그래프 시험을 통과했습니다. 재귀 시험 10건에 A↔B 사례가 포함됩니다. (c′) 정착 표본은 03단계입니다. |
| TEST-067(d) | 실제 청사진 소스의 참조 100·1,000·5,000개 입력을 캐시 없이 각 7회 분석해 1회 비용을 기록했습니다. 측정 방법·원자료·교대 비교와 비용 경로는 [청사진 측정](./blueprint-measure.md)에 있습니다. 스캐너 실행 시간으로 대체하지 않았습니다. |

## 실행 결과

`@canard/schema-form` 패키지에서 다음 명령을 종료형으로 실행했습니다. 앞선 타입 경계 보완 전 첫 전체 시험은 342파일·4,434시험 통과였으며 [중간 원로그](./round19-schema-form-test-pre-type.log)로 분리했습니다. 타입 보완 뒤 시험은 4,436건이었고, 아래는 A↔B 사례까지 더한 `a0d7c6dd6`에서 4개 명령을 다시 실행한 최종 결과입니다.

| 명령 | 결과 | 원로그 |
| --- | --- | --- |
| `yarn workspace @canard/schema-form test --run` | exit 0, 342파일·4,437시험. unit 241파일·3,508시험, render 52파일·539시험, Storybook Chromium 49파일·390시험 | [test](./round19-schema-form-test.log) |
| `yarn workspace @canard/schema-form lint` | exit 0 | [lint](./round19-schema-form-lint.log) |
| `yarn workspace @canard/schema-form typecheck --strict` | exit 0 | [strict](./round19-schema-form-typecheck.log) |
| `yarn workspace @canard/schema-form build` | exit 0, rolldown·선언·산출물 해시·패키지 타입 검사 완료 | [build](./round19-schema-form-build.log) |

전체 시험 로그에는 `blueprint.corpus.test.ts` 14건, `blueprint.type-inference-round19.test.ts` 15건, `blueprint.recursion.test.ts` 10건, `union.migration-shapes.render.test.tsx` 4건이 각각 포함됩니다. 이주 렌더 시험의 예상 오류 경계가 stderr에 기록됐지만 실패 시험은 없었습니다. lint·strict 원로그는 도구가 정상 종료하며 출력이 없어 빈 파일입니다. 빌드 뒤 git 작업 트리에 생성 산출물 변경은 없으며 dist는 커밋 대상이 아닙니다.

시나리오 패키지와 common-utils 소스는 19라운드 수정 범위 밖이므로 [이전 통합 검증](./integration-verification.md)의 통과 증거를 재사용합니다. 최종 filid 전체 스캔·외부 교차 확인은 루트 조정자의 PR 경계 작업입니다.
