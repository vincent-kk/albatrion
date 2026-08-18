# styleManager contract

## Requirements

- `destroyScope(scopeId)`는 `StyleManager.get(scopeId)`를 호출한 뒤 그 인스턴스의 `destroy()`를 호출하고 `void`를 반환한다.
- `styleManagerFactory(scopeId, config?)`는 `StyleManager.get(scopeId, config)`로 싱글톤을 획득한 뒤, `(styleId, cssString, compress?)`를 받아 `manager.add(...)`를 호출하고 `() => manager.remove(styleId)` 형태의 cleanup 함수를 반환하는 함수를 돌려준다.
- 두 함수 모두 스코프 생명주기 상태를 자체적으로 갖지 않는다 — 모든 상태는 `StyleManager` 싱글톤 레지스트리가 소유한다.

## API Contracts

- `destroyScope(scopeId: string): void` — 존재하지 않는 scopeId를 포함해 어떤 문자열에도 예외 없이 동작하며, `StyleManager` 쪽에서 던진 예외는 그대로 전파한다.
- `styleManagerFactory(scopeId: string, config?: StyleManagerConfig): (styleId: string, cssString: string, compress?: boolean) => () => void` — `config.shadowRoot`가 있으면 그대로 `StyleManager.get`에 전달되어 Shadow DOM 스코프를 결정한다.
- 엔트리 포인트는 두 심볼만 export한다.

## Acceptance Criteria

### destroy-scope-delegation — destroyScope의 StyleManager 위임 계약

- `destroyScope(scopeId)` 호출은 항상 `StyleManager.get(scopeId)`를 그 scopeId로 정확히 1회 호출하고, 반환된 인스턴스의 `destroy()`를 정확히 1회 호출한다.
- 같은 scopeId를 반복 호출하거나 빈 문자열·특수문자 scopeId를 전달해도 각 호출이 독립적으로 처리된다.
- 반환값은 항상 `undefined`이다.
- `destroy()`가 예외를 던지면 `destroyScope`는 그 예외를 삼키지 않고 그대로 던진다.

### flat-export-shape — 진입점의 정확한 export 형태

- `index.ts` 모듈은 `destroyScope`와 `styleManagerFactory` 두 심볼만 export하며 그 외의 이름은 없다.
- 두 심볼 모두 함수 타입으로 export된다.
- 모듈 import 자체가 예외 없이 성공한다.

## Boundary Exemptions

### `*.ts` — fractal root의 flat 두 함수 컬렉션 유지

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `destroyScope.ts`와 `styleManagerFactory.ts`는 둘 다 `StyleManager` 싱글톤에 위임하는 한 함수짜리 얇은 어댑터이며, entry point가 이름으로 재수출하는 이 fractal의 정본 형태다. organ으로 옮기면 두 파일을 감싸는 배럴 깊이만 늘어나고 위임 관계는 바뀌지 않는다.

## Last Updated

2026-08-18 — 최초 계약 작성. #329 문서화 작업으로 신설.
