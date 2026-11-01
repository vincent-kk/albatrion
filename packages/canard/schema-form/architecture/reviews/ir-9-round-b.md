# IR-9 round b — adopted review decisions

- 【추론】 IR-9 round b: 코덱스 교차 검토가 확인한 enclosed mount의 GUARD_FAILED 오류를 수정한다. 가드 실패 기록은 mount 점검을 포함해 그 mount를 연 사슬의 origin을 쓴다(첫 mount·reset·rebuild는 load, 쓰기 리스너·onChange의 reset은 write). Amendment 1의 mountingGuardPass이면 load로 고정한다는 문장은 이 결정이 대체하며 개발·운영의 origin 차이를 끝낸다.
- 【추론】 IR-9 round b: 트리 생성 중 만든 기록(블루프린트 진단·DialectMismatch)은 누가 생성을 불렀든 load다; 생성된 트리가 사슬 안에서 낸 기록은 그 사슬을 연 작업의 origin을 따른다. 새 runtime에서 트리를 만들고 DialectMismatch를 직접 보고하므로 생성은 별도 load 연산이다.
