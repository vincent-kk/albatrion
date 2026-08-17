# providers — DETAIL

## Requirements

- 각 Context는 Provider 컴포넌트와 소비 훅을 쌍으로 제공한다; Context 값 변경은 Provider 내부에서만 일어난다.
- 부모 barrel(`index.ts`)은 **훅만** 재수출한다 — Provider 컴포넌트는 부모 표면에 없다.
- Provider 컴포넌트와 그 Props 타입은 각 자식 fractal의 진입점을 통해서만 소비한다 — 마운트는 `bootstrap`의 책임이다.

## API Contracts

훅 채널 — 부모 barrel이 공개하는 소비 표면:

| 훅                                                  | 보증                                                          |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `useModalManager(id?)`                              | `getModal(id)` 결과를 `id`·`getModal` 변경 시에만 재계산      |
| `useConfigurationOptions()`                         | 설정 중 options만 반환 (컴포넌트 오버라이드 제외)             |
| `useConfigurationDuration()`                        | `{ duration, milliseconds }` — 문자열을 ms로 변환해 함께 제공 |
| `useConfigurationBackdrop()`                        | backdrop 색상 문자열                                          |
| `use*Context()` (Manager·Configuration·UserDefined) | 각 Context 전체 값                                            |

경계 사실: Provider 컴포넌트(`*ContextProvider`)와 `ConfigurationContextProviderProps`는 부모 barrel에 없고 자식 진입점에서만 나온다 — 훅(일반 소비)과 마운트(bootstrap 전용)의 소비자가 달라 표면을 분리했다.

## Acceptance Criteria

### options-resolution — options prop은 대체와 폴백으로 해석된다

- `options` prop이 비워지면 기본값으로 폴백한다.
- 대체 options 객체를 주면 그 값이 적용된다.

### hooks-only-surface — 부모 진입점은 훅 전용이다

- `providers/index.ts` 재수출 목록에 Provider 컴포넌트가 나타나지 않는다.

## Last Updated

2026-08-18 — 문서 신설. 훅 전용 부모 표면과 Provider 마운트 경로 분리, options 해석 계약(`__tests__` 검증)을 명문화 (issue #331, FIX-052).
