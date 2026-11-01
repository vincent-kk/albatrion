# 결함 수정 설계

Planning method: coordinator defect-round design through Amendment 2.

## DR-1 — 실행 중 자원 수명

ValidationLifetime에 inflight Map을 둡니다. runFieldNodeValidation이 validator와 authoredRoot를 한 번 잡고 유효한 검증기만 컴파일 점검 전 pin·finally unpin합니다. counts는 커밋 소비자만 셉니다. LRU 두 곳은 상한 8까지 오래된 비고정 후보를 반복 축출하며 후보가 없으면 멈춥니다. unpin은 빈 키 제거·이미 recent인 루트의 순서 갱신만 합니다. 같은 $id 교체는 핀을 무시하는 기존 계약입니다. 비용은 검증당 Map 증가·감소이며 핀 없는 경로에는 새 순회를 더하지 않습니다.

## DR-2 — 슬롯 판정 호스트 전달

reportLoadValidationFailure는 compile 거부를 제외한 원본 오류를 host에 전달합니다. MultipleErrors는 첫 원인부터 소비자 오류까지 순서대로 전달합니다. engine의 onError 기록은 그대로이며 새 capture는 없습니다. 비용은 host 전달 한 번과 bundle 길이만큼 순회입니다.

## DR-3 — 충돌 해제 뒤 한 번 재시도

assertValidationRootReady의 조건은 failure && duplicate === true && retried !== true && 다른 같은 id의 retained root 없음입니다. 기존 same-id 축출을 evictSameIdRoots로 추출하여 생성과 재시도에서 같이 씁니다. 문자열 id·recent 복사 순회·자기 자신 제외·생성 시 counts 삽입 전 호출을 보존합니다. 같은 entry.copy를 컴파일하며 기존 guards와 반환된 guard 참조를 유지합니다. 성공 시 컴파일 실패·중복 원인·거부 객체와 중복 메시지 guard 실패를 지우고 실패 시 기존 정체성을 유지합니다. guard 경로는 재시도하지 않습니다. 재시도는 entry당 한 번이며 정상 실행에는 조건 점검만 추가합니다.

플러그인은 실패한 compile과 compileGuard 뒤 같은 copy 재컴파일을 지원해야 합니다. shipped ajv6·7·8은 충돌 루트를 sibling instance로 분리하므로 duplicate throw double을 별도로 검증합니다. double의 compileGuard는 copy를 등록하지 않고 동기 gate를 반환합니다. ajv8은 guard compile에서 copy를 등록할 수 있습니다. guard-only compile인 item G는 호출 순서·생산 컴파일 시점 변경 때문에 유보합니다.

## 한계

- DR-1: 소비자 없는 같은 id 교체는 고정 사본도 실행 중 해제할 수 있습니다. recent overflow는 unpin 뒤 다음 축출점까지 남을 수 있습니다.
- DR-3: 같은 handler의 rebuild(); validate() 또는 commit 전 timer·transition 슬롯 실패는 로드 검증을 unavailable로 유지합니다.
- D9: ERROR-023 항목 2가 우선합니다. 생략된 componentStack·path는 onError에 없고 boundary console.error만 보유합니다. seen 삭제 뒤 native submit은 같은 compile 거부를 다시 보고할 수 있습니다.

## 근거와 검증

계약은 [결정 기록](../../reviews/defect-round.md), 재현과 관문은 [검증 계획](verification.md)에 연결합니다. 공개 src/index.ts·선언·버전은 바꾸지 않으며 산출물은 소스와 다른 커밋으로 보존합니다.
