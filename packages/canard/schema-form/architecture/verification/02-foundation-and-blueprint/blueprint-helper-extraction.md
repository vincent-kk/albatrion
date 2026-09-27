# 청사진 내부 함수 경계 보완

통합 verifier가 `seiri_function-boundaries` §3의 내부 보조 함수 8줄 상한 위반 두 건을 확인했습니다. 의존 등록과 형상 순회 함수를 각각 소유 함수 이름 아래 `utils/`로 추출하고 닫힌 문맥의 context·순회 집합을 명시 인자로 전달했습니다. 새 독립 계약이나 공개 export를 추가하지 않았습니다.

추출 전 129개 시험 통과 결과에서 표현식·재귀 시험의 단언을 바꾸지 않고 추출 후 17개를 재실행했습니다. 시험·lint·format·strict 모두 exit 0이며 `blueprint-helper-*.log`를 첨부했습니다. 전체 4,393시험 증거 이후의 변경은 이 의미 보존 추출뿐입니다.

편집 훅의 “organ utils 하위는 flat” 경고 두 건은 발견으로 보존합니다. 이 배치는 저장소 `seiri_function-boundaries` §4가 요구하는 소유 함수 아래 보조 함수 배치이며, 별도 INTENT나 진입점이 없는 내부 organ입니다. 최종 filid 결과와 함께 대조합니다.
