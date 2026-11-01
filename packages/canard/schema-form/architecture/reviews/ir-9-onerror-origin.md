# IR-9 onError origin decisions

- 【추론】 IR-9: onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution. FormErrorRecord의 surface·aggregate를 제거하고 필수 origin(load·write·validate·submit·render)을 둔다. 앞선 보충의 surface 이름(thrown·rejected·sink)은 origin으로 대체한다; 호스트 싱크와 프로미스 거부를 뜻하는 문장은 그대로다.
- 【추론】 IR-9: 사슬을 연 최외곽 연산이 origin을 정하며 중첩·adoption에 보존한다. reset·rebuild·validator 교체와 최초 외부 errors 적용은 load, 공개 쓰기와 prop errors 변경은 write, 검증 컴파일·실행·판정 파동과 그 리스너는 validate, SubmitWhileDegraded와 native capture 최초 실패는 submit, 렌더 경계·ChildNodeComponentsOnTerminal은 render이다. write 리스너나 onChange의 reset은 write이며 reset의 중첩 쓰기는 load이다. 개발 warnDevelopmentIssue는 기록이 아니다.
- 【추론】 IR-9: 각 발생 기록에는 묶음을 싣지 않으며 실제 throw의 bundleChainErrors는 유지한다. 같은 수집 호출의 첫 병합 오류·details를 보존한다. 자동·명시적 검증, 전달·중복·caller·console·재진입 규칙은 유지한다. ERROR-017·019·021·023·005·041·139·164·197·201, VALIDATE-046, REACT-007, TEST-017을 함께 적용한다.
