# TEST-067 스캐너 확인

`yarn workspace @winglet/json-schema build`가 exit 0으로 끝난 뒤, schema-form 작업 디렉토리에서 `node architecture/verification/02-foundation-and-blueprint/scanner-corpus.mjs`를 실행했습니다. 빌드 산출물은 커밋하지 않습니다.

원본 `architecture/spikes/guard-cost/redteam3/corpus.mjs`의 14종 모두 스캔이 종료되었고 작성 스키마의 JSON 직렬화 결과가 실행 전후 동일했습니다. 합계 197개 위치, 29개 참조 기록, 재귀 pydantic 표본의 순환 중단 신호 1개를 확인했습니다. 원시 결과는 `scanner-corpus.json`에 있습니다. 시간은 스캐너 관찰값이며 청사진 벤치로 대신하지 않습니다.

스캐너는 참조 처리 뒤의 `exit` 방문자에서 `referencePath`·`referenceResolved` 및 `referenceSkipped: 'cycle'`을 제공합니다. `hasReference`는 해석되지 않은 참조에만 설정되므로, 성공한 참조까지 수집할 때 `referenceResolved`도 함께 확인합니다. 최초 프로브는 처리 전 `enter`에서 관찰하여 순환 신호 단언에 실패했고, 이후 성공한 참조를 `hasReference`만으로 걸러 대상 위치 단언에 실패했습니다. 실제 방문자 시점과 필드 계약에 맞춰 프로브를 교정한 뒤 두 단언 모두 통과했습니다.

이 결과는 TEST-067(a)의 스캐너 역량과 원본 코퍼스의 스캔 종료만 입증합니다. TEST-067(b)의 청사진 수용 여부, (c)의 무한 형상 오류·절단 표본, (d)의 청사진 1회 비용은 별도 청사진 검증 결과로 판정합니다. 형 없는 객체 분기를 제한하는 BLUEPRINT-039와 코퍼스의 관계도 그 결과에서 구분해야 합니다.
