# 결함 검증 계획

## 재현과 판별력

D4·D5는 render/react18에서 red, D6·D7은 실제 onInactive 호출을 확인한 green guard입니다. 기준 JSON을 raw/defect-round에 gzip하고 커밋된 시험 텍스트의 sha256을 붙입니다. DR-1은 unmount된 슬롯의 async 판정 중 서로 다른 루트 9개 이상 compile/release, counts 복원·무검증기·같은 id pending 교체를 확인합니다. DR-2는 슬롯 ValidatorThrew의 onError 1·host 1과 MultipleErrors 원소 순서를 확인합니다. DR-3은 retained 충돌·해제 뒤 성공·제3 retained 루트·실패한 재시도의 원래 rejection·guard 정체성 및 ajv6·7·8을 확인합니다. pin 제거·host 전달 제거·재시도 전 same-id 축출 제거의 세 변이가 각 시험을 실패시켜야 합니다.

## 순차 관문

lint 경고 0 → typecheck → build → unit → render → react18 → verify → storybook → production → import-model 순서입니다. 그 뒤 공개 표면 불변, FCA 신규 finding 없음, 원장 신규 finding 없음, 추가 텍스트와 신규 gzip 해제본의 머신 경로 없음, 기존 skip·todo 불변을 확인합니다. 전체 관문은 Amendment 3 적용 뒤 실행합니다. 결과는 한국어 defect-round-results.md에 각 결함·재현·수정·red/green·변이·한계·관문을 기록합니다.
