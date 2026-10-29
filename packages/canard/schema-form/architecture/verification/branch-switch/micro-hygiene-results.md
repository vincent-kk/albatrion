# 미시 위생 검증

기준은 `1c3655a10`이며 제품 범위는 `src`에서 시험·벤치·스토리·동결된 `__legacy__`를 제외한 TypeScript/TSX입니다. 횟수는 주석과 예제 문자열을 제외한 AST 노드 수입니다. 계획의 텍스트 검색 수와 범위가 다르므로 직접 비교하지 않습니다. 새 공개 API나 상주 구조를 추가하지 않고 시험을 삭제하거나 약화하지 않습니다.

## 항목 1 — 포인터 상수

포인터 도우미 전체와 엔진을 훑어 **37파일·107개 문자열 리터럴**을 기존 `JSONPointer` 상수 참조로 바꿨습니다. 파싱된 연산자의 `PointerOperator` 심볼은 그대로 유지합니다. fragment와 separator의 합성은 기존 두 상수를 조합합니다.

유지 지점과 이유:

- `constants/JSONPointer.ts`의 확장 토큰은 상수의 정의 자체입니다.
- `utils/parsePointerSegment.ts`·`parseStandardPointer.ts`의 `~`, 후자의 `%`, `formatSegment.ts`·`parsePointerSegment.ts`·`isReservedPercentName.ts`의 예약 퍼센트 표기는 기존 상수에 대응 멤버가 없습니다. 이스케이프 구현은 계속 winglet이 소유합니다.
- `resolvePointer.ts`의 `segment === ''`는 빈 이름이고 루트 토큰과 다른 문법 역할이므로 유지합니다.
- 엔진 식 토크나이저의 `.` 및 오류 코드에서 namespace를 자르는 `.`는 포인터가 아닙니다. 템플릿 문자열에 든 스키마 키워드·주소 예제·진단 문장은 보존합니다.

첫 표적 시험은 workspace `@winglet/json` dist 부재로 7파일 적재가 실패했습니다. 설치 없이 지정된 common-utils와 json build로 준비했고, 수정 전후 동일한 포인터 시험 **8파일·96건**, 수정 뒤 패키지 typecheck·lint를 통과했습니다. lint의 첫 실행도 미준비 json-schema·react-utils dist 때문에 실패했으며 지정 build 뒤 통과했습니다. 상수의 literal 형으로 좁아진 조립 변수는 `string` 주석으로 원래 형을 유지합니다.

## 항목 2 — 고빈도 membership과 체인

제품 `.includes`는 **84 → 35**로 줄었습니다(**49개 치환**). 정착·파생·탐색·런타임 유효 스키마·쓰기 시 청사진 아이템 조회·포인터 해석·입력 해석을 대상으로 했습니다. optional 배열의 부재는 기존 분기/기본값을 유지하며, 숫자 ID·문자열·객체 identity만 비교해 `NaN`의 SameValueZero 차이를 만들지 않습니다.

배열 정렬 후보의 `filter/map`, 나감 식 색인의 `filter/map`, 파생 감시 의존의 `filter/map`을 단일 순회로 합쳤습니다. 유효 선언 선택의 연속 `filter` 세 곳도 단일 수집 순회와 기존 정렬로 대체했습니다. **체인/선택 4지점**이며 제거한 prototype iteration은 10개입니다. 파생 의존 값은 원래 식 의존 다음 감시 의존 순서이고, 중복 제외 조건·평가 횟수는 그대로입니다.

유지한 35개 membership 지점은 [항목 2 원시](raw/micro-hygiene/item-2.json)의 `kept`에 파일·행으로 전부 열거했습니다. 청사진 작성 검증·기능 분석·정적 마운트·입력 정의 준비는 일회성 경로입니다. UI의 checkbox 선택 membership은 임의 값의 `NaN` 의미를 보존하며, union 렌더의 선택과 정의 매칭은 이후 반복 정리에서 함께 검토합니다. 제품 전체 반복 방식은 항목 5에서 별도 집계합니다.

표적 포인터·유효 스키마·파생·배열·나감·배달 시험 **44파일·436건**, 패키지 typecheck·lint를 통과했습니다. 추가 세 지점에서도 typecheck·lint를 재확인했습니다.

## 항목 3–6

진행 중입니다.

## 최종 정적 관문

미실행입니다.

## 측정 장치와 창

미실행입니다. `tools/iv-2/window.mjs` 계열의 공개 행과 힙 장치를 재사용하며, Ⅳ-1의 `summarize.mjs`·`weightedExchange.mjs`·`judgeStage.mjs` 판정은 유지합니다. Ⅳ-2 전용 할당·exit self·cold 지연 생성 추가항은 이 정리에 해당하지 않으므로 별도 어댑터에서 제외할 예정입니다. 최종 판정은 미시 위생 계획에 따라 모든 행의 폭 밖 퇴보 0과 가중 교환비 ≤ 0이며, 교환비 0도 허용합니다.
