# FieldInputStringCheckbox 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 문자열 checkbox 입력 몫을 구현합니다(257C-01, 대기열 38).

## API Contracts

- 선택지마다 `${path}-${index}` 형태의 고유 id를 주고, 그 선택지를 감싼 label의 `htmlFor`를 같은 id로 맞춥니다. 색인을 쓰는 까닭은 enum 값에 공백이 올 수 있어서입니다. 선택지 묶음 컨테이너는 `role="group"`과 `aria-labelledby="label:${path}"`를 가지며, 묶음의 이름은 필드 제목 요소(id `label:${path}`)가 줍니다(대기열 38, 276라운드).
- 배열이 아닌 값(문자열·수·객체)에도 예외 없이 그리며 어느 칸도 체크하지 않고, 체크 한 번이 그 값을 유효한 배열로 바꿉니다. `misfit` 이 참이면 묶음 컨테이너에 `aria-invalid="true"` 만 붙이고 어떤 문구도 그리지 않으며(무효 문구는 폼의 오류 렌더링 몫), 유효한 배열이 쓰이면 뗍니다(REACT-027, SURFACE-061, 444C-08).
- `type.ts`는 이 입력의 스키마·문맥 형을 정의합니다.

## Acceptance Criteria

### checkbox-ids — 선택지 연결

- 선택지 id는 서로 다르고 각 label의 `htmlFor`가 그 id와 같습니다(257C-01). 묶음은 필드 제목을 이름으로 가진 `group` 역할로 찾을 수 있습니다(대기열 38).

### checkbox-guard — 배열 아닌 값과 경고등

- 배열이 아닌 값에도 예외 없이 그려 어느 칸도 체크하지 않고, `misfit` 이 참이면 묶음에 `aria-invalid="true"` 만 붙으며(문구는 그리지 않음) 체크 한 번이 유효한 배열을 써 표지가 사라집니다(444C-08).

## Last Updated

2026-10-14: 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
2026-10-26: 배열 아닌 값의 가드와 misfit 표지(444C-08, C7' 문구 제거).
