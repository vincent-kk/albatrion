# 377라운드 — 닫기 (items 조각 층 결함 PR #403 병합 3f02269ab; 편집자 결정 하나)

2026-10-15. 373라운드 소유자 답과 376C-02 보충대로 배열 조각의 controls가 아이템에 닿도록 고친 PR을 닫는다. 구현은 374라운드 지시 전에 잡은 Claude 작업자가 했고, 도우미 시험 14건·settle 7건·blueprint 3건·derive 차등 2건, 끝 슬래시 변이(14건 실패), 전체 게이트, agy 검증(결함 없음, 보강 1회)을 거쳐 원장 관리자가 squash 병합했다(3f02269ab). 기존 시험 기대 변경은 0건이다.

## 편집자 결정

- **377C-01 (조각 소유 판정 한 벌의 자리와 범위, 조각 꺼짐 나감의 unsetOnInactive 우선).**
  - 【추론】 선언 경로가 어느 조각에 속하는지는 engine의 utils/controls에 둔 도우미 하나(getFragmentOwnerPaths)가 정하고, blueprint의 buildFeatureNodeIndex·settle의 getControlLayers·derive의 getDeriveRuleTable 세 호출부가 같은 판정을 쓴다. 세 사용자가 engine의 서로 다른 자식 fractal이라 가장 낮은 공통 fractal은 engine이고, 기관은 공통 조상이 될 수 없으며, 도우미는 문자열만 받아 자식의 형을 가져오지 않는다. 판정은 선언 경로가 조각 경로 뒤에 /properties/·/prefixItems/로 이어지거나 /items·/additionalItems로 이어지고 그 뒤가 끝이거나 /인 경우이며, 키워드와 같은 이름의 속성이 만드는 키워드 그릇 경로 후보는 선언 경로가 될 수 없어 호출부의 실제 자식 포함 판정에서 걸러지므로 옛 접두 판정과 동치다. 이로써 조각이 items·additionalItems로 선언한 아이템은 상태 키 색인에 별표 자리로, prefixItems와 옛 튜플 items 자리는 색인 이름으로 들고, 아이템마다 그 조각의 default·unsetOnInactive·상태 키를 조각 층으로 받으며, 조각이 꺼져 아이템이 나갈 때는 그 조각의 unsetOnInactive가 Form 정책보다 앞선다(WRITE-032). 조각 derive 규칙은 getDeriveRuleTable이 대상 후보를 객체 속성 항목에 한정하므로 아직 아이템에 닿지 않고 376C-02의 별도 PR이 고친다.

## 남은 것

fixy08: 파생 규칙 PR(codex 구현, agy 검증) → L2b(P-08 재구현을 이 도우미 위에서, P1 가드, 18C 재측정, H10 결론, P-139). fairy08: 파생 규칙 PR의 기대 변경 대조. 결정 대기열 54·58은 열려 있다.

다음 라운드 번호는 378이다.
