# G 검증 계획

기준 red: if-None mount compile0, if-OnChange 다음 프레임 뒤 compile, guard read compile0, 같은 id 중간 해제 성공입니다. 특성화는 mount·reset·root 교체·rebuild·validator 교체의 gate/effective schema, 슬롯·명시 검증·제출 실패, duplicate 감지·retry를 보존합니다. M1 생성 compile, M2 guard demand, M3 demand 생략, M4 demand 퇴출 생략을 각각 검출합니다.

수용 사전등록: mount-if-flat-500-none·mount-if-flat-500-validate·mount-flat-500-none·mount-flat-500-validate, 각 build20회. control 유효 폭 max(0.3ms,3%), 무효1회 재시도 뒤 재무효 VOID입니다. if-None은10%·16.7ms 이상 및 control gap2배 초과 절감, if-OnChange는10%·16.7ms 이상 절감, 최초 onValidate 지연은 기준+16.7ms 이내, guard-free는 max(0.5ms,3%) 이내 회귀여야 합니다. 첫 판정은 mount 시작부터 Form 첫 onValidate 전달까지입니다.

전체 수용 측정은 이번 구현 작업에서 실행하지 않습니다. 전체7프로젝트·정식 build·플러그인3종·시나리오·원장·FCA·기계 경로·버전 관문을 순차 수행합니다.
