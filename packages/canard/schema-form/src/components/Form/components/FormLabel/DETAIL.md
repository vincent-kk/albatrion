# FormLabel 계약

## Requirements

- 부모 Form의 `Form.Label` 계약(대기열 38, 소유자 결정)과 렌더러 속성 계약(LANDING-035·067)을 구현합니다.

## API Contracts

- `FormLabel.tsx`는 `memo` 컴포넌트입니다. `<label>`에 `style`·`className`·`htmlFor={path}`를 두고, `path`가 있으면 id `label:${path}`도 둡니다. 그 안에는 렌더러 문맥의 `FormLabelRenderer`로 그린 `FieldProxy`를 넣으며, 문맥에 없으면 `PluginManager.FormLabelRenderer`를 씁니다.
- `types/props.ts`는 `FormLabelProps`(`path`·`style`·`className`)를 정의합니다.

## Acceptance Criteria

### label-ids — 제목 연결

- 단일 입력은 `htmlFor`로, 묶음 입력은 `aria-labelledby`의 `label:${path}`로 같은 label에 연결됩니다.

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormLabelProps`는 이름으로 진입점에 올라 `components/Form/index.ts`를 거쳐 `src/index.ts`가 공개한다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
