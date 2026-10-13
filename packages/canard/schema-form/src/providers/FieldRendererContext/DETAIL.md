# FormTypeRendererContext

## Requirements

폼 렌더러와 오류 표시 정책을 외부 설정 및 플러그인 폴백과 결합합니다.

## API Contracts

- 폼 지정 렌더러·포맷터가 외부 설정보다 우선하며 누락된 값은 플러그인 폴백으로 보완합니다.
- 오류 표시 판단은 명시적 ShowError 상태를 먼저 보고 정책 비트를 평가합니다. 기본은 dirty와 touched의 동시 충족입니다.

## Acceptance Criteria

### form-type-renderer-context-contract — 관찰 가능한 동작

- 명시적 오류 표시 상태가 일반 dirty/touched 정책에 가려지지 않습니다.
- 사용자 렌더러가 없어도 소비자는 폴백 렌더러를 얻으며 Context 자체는 이를 렌더하지 않습니다.

## Last Updated

2026-09-16
