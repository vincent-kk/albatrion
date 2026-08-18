# withUploader — 파일 업로드 트리거 HOC

## Purpose

클릭 가능한 컴포넌트를 파일 업로드 트리거로 변환하는 단일 HOC를 소유한다. 숨겨진 파일 input을 통해 네이티브 파일 선택 다이얼로그를 열고, 선택된 파일을 콜백으로 전달한다. 공개 표면은 이 HOC 하나뿐이며, fractal 루트는 같은 이름의 구현 파일 하나로 구성된다.

## Conventions

- 원본 onClick 핸들러는 파일 다이얼로그를 열기 전에 항상 먼저 호출된다.
- change 이벤트가 발생할 때마다(파일 존재 여부와 무관하게) input 값을 초기화해 동일 파일을 다시 선택할 수 있게 유지한다.
- 파일이 없는 change 이벤트에서는 onChange를 호출하지 않는다.

## Boundaries

### Always do

- 원본 onClick 호출과 input 값 초기화 순서를 유지한다
- 선택 처리·accept 처리 방식 등 동작 계약을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- HOC 시그니처 확장(다중 파일 선택, 드래그앤드롭 등 새 옵션 추가)
- accept 포맷 결합 방식(구분자 등) 변경

### Never do

- 선택된 파일을 onChange 호출 없이 삼키는 경로 추가
- 원본 컴포넌트에 전달되는 props(래핑된 onClick 제외)를 변형하는 로직 추가
