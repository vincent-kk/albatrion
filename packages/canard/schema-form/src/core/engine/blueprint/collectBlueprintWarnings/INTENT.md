# collectBlueprintWarnings

## Purpose

정적 선언에서 알 수 있는 작성 실수와 지원 한계를 진단 소비자에게 경고합니다.

## Conventions

- 경고는 결과를 바꾸지 않으며 작성 위치와 함께 전달합니다.
- 중복 억제는 수집 호출 안의 code·schemaPath·keyword 단위입니다.

## Boundaries

### Always do

- 소비자가 있을 때만 경고 경로를 조사합니다.
- 내용 평가가 필요 없는 정적 정보만으로 진단합니다.
- terminal 인라인 예약 키는 해당 terminal의 한 기록으로 모읍니다.

### Ask first

- 경고 범위·중복 기준·전달 형태를 바꿀 때

### Never do

- 경고를 정적 오류나 값 수정으로 바꾸지 않습니다.
- if의 내용을 평가하거나 인라인 경고를 찾으려고 참조를 따라가지 않습니다.
- 작성 값을 변경하지 않습니다.
