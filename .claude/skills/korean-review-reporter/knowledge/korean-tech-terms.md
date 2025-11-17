# Korean Technical Terms Dictionary

한국 개발자들이 자연스럽게 이해할 수 있도록 기술 용어를 일관되게 번역합니다.

## 코드 리뷰 용어

### 변경 유형
| English | Korean | 사용 예시 |
|---------|--------|----------|
| Refactoring | 리팩토링 | 단순 리팩토링 |
| Breaking Change | 브레이킹 체인지 | 브레이킹 체인지 확정 |
| Logic Change | 로직 변경 | 로직 변경사항 |
| File Movement | 파일 이동 | 파일 이동 및 순서 변경 |
| Bug Fix | 버그 수정 | 버그 수정 |
| Feature Addition | 기능 추가 | 새로운 기능 |
| Configuration | 설정 변경 | 설정 변경 |

### Git 용어
| English | Korean | 사용 예시 |
|---------|--------|----------|
| Commit | 커밋 | 특정 커밋 분석 |
| Branch | 브랜치 | 브랜치 비교 |
| Staged Changes | 스테이지된 변경사항 | 스테이지된 변경사항 분석 |
| Merge Base | 공통 조상 | 공통 조상부터 현재까지 |
| Merge Conflict | 머지 충돌 | 머지 충돌 감지 |
| Diff | 차이점 | 코드 차이점 분석 |

### 분석 관련
| English | Korean | 사용 예시 |
|---------|--------|----------|
| Complexity Score | 복잡도 점수 | 복잡도 평가: Score 5 |
| Risk Level | 리스크 레벨 | 리스크 레벨: 위험 |
| Impact Assessment | 영향도 분석 | 영향도 분석 결과 |
| Affected Area | 영향받는 영역 | 영향받는 영역: 14개 파일 |
| Code Review | 코드 리뷰 | 코드 리뷰 결과 |
| Analysis Mode | 분석 모드 | 분석 모드: 브랜치 비교 |

## 리스크 레벨

| English | Korean | Emoji |
|---------|--------|-------|
| Critical | 위험 | 🔴 |
| High | 높음 | 🟠 |
| Medium | 보통 | 🟡 |
| Low | 낮음 | 🟢 |

**사용 예시**:
- `🔴 위험 (Critical)`
- `🟠 높음 (High)`
- `🟡 보통 (Medium)`
- `🟢 낮음 (Low)`

## 액션 아이템

### 우선순위
| English | Korean | 설명 |
|---------|--------|------|
| Must Do | 필수 조치 | 반드시 수행해야 함 |
| Should Do | 권장 조치 | 수행을 강력히 권장 |
| Consider | 고려 사항 | 선택적으로 고려 |

**사용 예시**:
```markdown
**필수 조치** (✅ Must Do):
1. 14개 파일의 모든 `getFromCache` 호출에 `await` 추가

**권장 조치** (⚠️ Should Do):
1. 마이그레이션 가이드 문서 작성

**고려 사항** (💡 Consider):
1. 성능 벤치마크 테스트
```

### 액션 동사
| English | Korean |
|---------|--------|
| Add | 추가 |
| Update | 업데이트 |
| Fix | 수정 |
| Remove | 제거 |
| Refactor | 리팩터링 |
| Test | 테스트 |
| Document | 문서화 |
| Validate | 검증 |
| Review | 검토 |
| Deploy | 배포 |

## 코드 관련

### 타입 시스템
| English | Korean |
|---------|--------|
| Type Safety | 타입 안전성 |
| Type Definition | 타입 정의 |
| Interface | 인터페이스 |
| Generic | 제네릭 |
| Type Annotation | 타입 어노테이션 |
| Type Inference | 타입 추론 |

### 함수/메서드
| English | Korean |
|---------|--------|
| Function Signature | 함수 시그니처 |
| Parameter | 매개변수 |
| Return Type | 반환 타입 |
| Async Function | 비동기 함수 |
| Callback | 콜백 |
| Promise | 프로미스 |

### 아키텍처
| English | Korean |
|---------|--------|
| API | API |
| Component | 컴포넌트 |
| Service | 서비스 |
| Util/Utility | 유틸리티 |
| Helper | 헬퍼 |
| Hook | 훅 |
| Middleware | 미들웨어 |
| Plugin | 플러그인 |

## 프로젝트 구조

| English | Korean |
|---------|--------|
| Monorepo | 모노레포 |
| Package | 패키지 |
| Workspace | 워크스페이스 |
| Module | 모듈 |
| Directory | 디렉토리 |
| File | 파일 |

## 테스팅

| English | Korean |
|---------|--------|
| Unit Test | 유닛 테스트 |
| Integration Test | 통합 테스트 |
| E2E Test | E2E 테스트 |
| Test Coverage | 테스트 커버리지 |
| Mock | 목(Mock) |
| Stub | 스텁(Stub) |
| Test Case | 테스트 케이스 |

## 성능

| English | Korean |
|---------|--------|
| Performance | 성능 |
| Optimization | 최적화 |
| Caching | 캐싱 |
| Memory Leak | 메모리 누수 |
| Bottleneck | 병목 |
| Latency | 지연 시간 |
| Throughput | 처리량 |

## 보안

| English | Korean |
|---------|--------|
| Authentication | 인증 |
| Authorization | 권한 부여 |
| Encryption | 암호화 |
| Decryption | 복호화 |
| Validation | 검증 |
| Sanitization | 살균/정화 |
| Security | 보안 |

## 마이그레이션

| English | Korean |
|---------|--------|
| Migration | 마이그레이션 |
| Backward Compatibility | 하위 호환성 |
| Deprecation | 지원 중단 |
| Rollout | 롤아웃 |
| Rollback | 롤백 |
| Phased Deployment | 단계별 배포 |

## 문장 템플릿

### 검증 결과
```markdown
✅ 동일한 로직 유지 확인
✅ 타입 안전성 검증 완료
✅ 기능적 변경 없음
⚠️ 잠재적 문제 발견
❌ 타입 에러 발견
```

### 영향도 표현
```markdown
- 🔴 **브레이킹 체인지**: 함수가 이제 Promise를 반환함
- 🟡 **동작 변경**: 자동 폴백 메커니즘 추가
- 🟢 **개선사항**: 더 나은 에러 처리
```

### 조치 항목
```markdown
1. X개 파일의 모든 `functionName` 호출에 `await` 추가
2. 타입 정의 Y개 파일 업데이트
3. 테스트 코드 비동기 패턴으로 수정
4. CHANGELOG.md에 브레이킹 체인지 문서화
```

### 파일 경로 표현
```markdown
- **파일**: `packages/aileron/src/cache.ts`
- **라인**: (45-67번째 라인)
- **소스**: `abc1234` (commit) | `feature/async-cache` (branch) | staged
```

## 번역 원칙

1. **일관성**: 같은 영어 용어는 항상 같은 한국어로 번역
2. **자연스러움**: 한국 개발자들이 일상적으로 사용하는 표현 우선
3. **명확성**: 혼동의 여지가 없도록 명확하게 표현
4. **병기**: 필요시 영어를 괄호 안에 병기 (예: "프로미스(Promise)")
5. **보편성**: 특정 회사나 팀의 용어보다 업계 표준 우선

## 혼합 표현

일부 용어는 영어와 한국어를 함께 사용합니다:

- `API 변경` (not "응용 프로그래밍 인터페이스 변경")
- `TypeScript 컴파일러` (not "타입스크립트 컴파일러")
- `Git 커밋` (not "깃 커밋")
- `React 컴포넌트` (not "리액트 컴포넌트")

## 띄어쓰기

```markdown
✅ 타입 안전성 (O)
❌ 타입안전성 (X)

✅ 코드 리뷰 (O)
❌ 코드리뷰 (X)

✅ 브레이킹 체인지 (O)
❌ 브레이킹체인지 (X)
```
