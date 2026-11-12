# @lerx/promise-modal

## Requirements

Promise는 최초 확인·취소 또는 렌더 오류로 한 번만 확정됩니다. 렌더 오류는 거부로 전달되며 일반 취소는 종류별 취소 값으로 완료됩니다.

## API Contracts

환경별 effect와 animation만 루트 hooks organ에 남깁니다. 요청 수명은 handle, 저장소 구독·기본 경로는 app, Context별 전환·파괴 시점은 ModalManagerContext가 소유하여 공용 organ이 하위 프랙탈로 되돌아가지 않게 합니다. 패키지 공개 이름과 타입은 그대로 유지합니다.

- 프레임 메타데이터 선언은 모달 종류의 합집합과 독립적으로 소유하여, 기본 모달 → 프레임 → 종류별 모달로 되돌아오는 타입 순환을 만들지 않습니다.

- 내부 타입 소비자는 구체 선언 파일을 직접 참조하고, 패키지 공개 타입 표면은 이름을 명시한 재수출로 고정하여 내부 선언 추가가 공개 API를 넓히지 않게 합니다.

- React 18과 19에서 같은 공개 동작을 제공하고 ESM·CJS 배포 번들은 첫 문장으로 'use client'를 선언합니다. DOM 없는 가져오기와 서버 렌더 지원은 유지합니다.
- DOM 없는 서버 렌더에서 Provider와 공개 애니메이션 훅은 layout effect 경고를 내지 않습니다. 여러 프랙탈이 사용하는 환경별 effect 선택은 소스 루트의 hooks가 소유하며 브라우저에서는 layout 시점을 유지합니다.
- 동일한 전역 상태 구조 버전의 패키지 사본은 같은 시스템을 사용하며 버전이 다르면 격리하고 개발 경고를 냅니다.
- 기본 경로 훅은 Navigation API가 없을 때 살아 있는 노드가 있는 동안만 폴링합니다. 경로로 숨겨진 노드와 파괴 전 닫힌 노드도 살아 있는 동안 포함하며 마지막 파괴 시 예약을 취소합니다. 기본 훅으로 여는 노드의 initiator는 호출 순간의 pathname이므로 빈 기간의 이동도 반영합니다.
- closeOnEscape는 모달 Esc, 모달 배경 클릭, Provider Esc, Provider 배경 클릭 순으로 상속합니다. Esc가 취소할 모달을 고르는 규칙은 `app/DETAIL.md`에 있습니다.
- dimmed 모달은 포커스 이동·복원과 기본 Tab 가두기·스크롤 잠금 및 조상 경로 형제 inert를 제공합니다. 포커스 이동은 최상위 참여 모달만 처리하고 Tab 가두기는 전체 visible 미확정 최상위가 dimmed일 때만 적용합니다. trapFocus와 lockScroll은 기본 true이고 dimmed false에는 적용하지 않습니다. 사용자 프레임은 접근 가능한 이름·설명·역할을 제공합니다.

- useDestroyAfter는 지속시간과 Provider 폴백이 바뀔 때만 정규화하여 동일 입력의 부모 리렌더가 경고를 반복하지 않습니다.
- 설정 병합은 기본값, Provider, useModal 설정, 호출 인자 순이며 undefined는 상속하고 0과 false는 보존합니다.
- duration은 밀리초 숫자 또는 ms·s 문자열을 받으며 공개 설정 훅은 정규화된 ms 문자열을 제공합니다. 설정 훅과 파괴 훅은 모달 트리 안에서만 사용하며 밖에서는 사용 위치를 설명하는 오류를 냅니다.
- prompt 확인은 현재 값 그대로이며 입력이 없으면 undefined입니다. 일반 취소만 null이고 returnOnCancel 취소는 현재 값입니다.
- 공개 Props 타입은 애플리케이션 래퍼의 선언에 사용합니다. 프레임은 group·subtype·settled를 받고 alert 내용도 context를 받습니다.
- alive는 저장소에 남는 생명주기, visible은 경로에 따른 표시, settled는 결과 확정을 나타냅니다. 경로 숨김은 결과를 확정하지 않습니다.
- Provider 해제는 열린 노드를 마이크로태스크 뒤 취소하며 같은 커밋의 재마운트는 입력값과 Promise를 유지합니다. DOM 없는 가져오기와 서버 렌더는 가능합니다. 서버에서는 모달 열기 함수를 호출하지 않습니다.
- 개수와 상태 구독은 Provider 밖에서도 저장소를 읽습니다. 개수 판별 함수는 읽기 전용 ModalNodeView를 받으며 노드 발행에 따라 갱신됩니다.

## Acceptance Criteria

### platform-compatibility — 배포 경계와 경로 감지

- 두 번들의 첫 문장은 use client이며 React 18 테스트는 같은 공개 동작을 검증합니다.
- React 18의 서버 렌더도 소스와 배포 진입점에서 console.error 없이 Provider와 공개 애니메이션 훅을 렌더합니다.
- 모달이 없으면 기본 폴링은 예약되지 않고 첫 요청은 현재 경로를 기록합니다.

### modal-results — 모달별 완료 결과

- alert·confirm·prompt의 확인·취소 결과가 유지되고 렌더 오류는 거부됩니다.

### initialization-lifecycle — 초기화와 요청 연결

- 마운트 전 요청과 같은 커밋 재마운트는 원래 Promise와 입력값을 유지합니다.

### presentation-customization — 사용자 UI와 상태 구독

- 사용자 프레임과 Provider 밖 구독은 현재 노드 상태를 반영합니다.

### consumer-examples — 공개 계약을 사용하는 예제

- 기본·운영 테스트는 README와 사양서 양언어의 TypeScript 코드 블록을 추출해 빌드된 공개 선언으로 검사합니다. 이 문서의 코드 블록은 각각 완결된 모듈이며, 컴포넌트 props는 공개 타입을 사용하여 콜백 이름과 인자의 불일치를 드러냅니다.
- 스토리는 선언적 root, 키보드·포커스·스크롤, 렌더 오류 거부, 지속시간 형식과 경로 복귀를 사용자가 직접 확인할 수 있게 구성합니다.
- 테스트는 결과와 관찰 가능한 상태를 검증하며 테스트 안에서 만든 동작 자체를 검증하거나 같은 시나리오를 반복하지 않습니다.

### module-evaluation — 배포 사본의 평가 순서

- 같은 React runtime에서 독립 ESM 사본과 ESM·CJS 혼용은 같은 registry를 공유합니다. 다른 사본의 prompt draft와 Promise를 첫 Provider가 처리하며 키보드·격리·스크롤·포커스 자원을 소유자 하나가 정리합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
