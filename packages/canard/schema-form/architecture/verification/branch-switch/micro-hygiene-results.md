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

## 항목 2–6

진행 중입니다.

## 최종 정적 관문

미실행입니다.

## 측정 장치와 창

미실행입니다. `tools/iv-2/window.mjs` 계열의 공개 행과 힙 장치를 재사용하며, Ⅳ-1의 `summarize.mjs`·`weightedExchange.mjs`·`judgeStage.mjs` 판정은 유지합니다. Ⅳ-2 전용 할당·exit self·cold 지연 생성 추가항은 이 정리에 해당하지 않으므로 별도 어댑터에서 제외할 예정입니다. 최종 판정은 미시 위생 계획에 따라 모든 행의 폭 밖 퇴보 0과 가중 교환비 ≤ 0이며, 교환비 0도 허용합니다.
