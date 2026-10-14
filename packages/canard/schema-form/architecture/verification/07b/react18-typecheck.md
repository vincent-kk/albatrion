# React 18 형으로 본 내부 형 검사

2026-10-13, 브랜치 `feat/schema-form-07b-1`(head `0fef82171`). 07b 정리 목록의 "내부 형 검사가 @types/react 19 전용" 행의 기록입니다.

## 확인 명령

패키지 디렉토리에서 실행합니다.

```bash
../../../node_modules/.bin/tsc -p architecture/verification/07b/tools/tsconfig.react18.json --pretty false
```

`tools/tsconfig.react18.json`은 패키지 `tsconfig.json`을 그대로 확장하고, `react`·`react-dom`만 `packages/aileron/development-helper`가 설치한 @types/react 18.3.23으로 돌립니다. 패키지 `typecheck` 스크립트는 @types/react 19로만 돕니다.

## 결과

종료 코드 2, 오류 11건입니다. 모두 `src` 내부 파일이며 공개 d.ts가 내보내는 형은 아닙니다(개선-37의 공개 d.ts 차분 0).

| 원인                                                             | 건수 | 위치                                                                                |
| ---------------------------------------------------------------- | ---: | ----------------------------------------------------------------------------------- |
| React 18에 `SubmitEvent` 형이 없음                               |    1 | `components/Form/components/FormRootProxy.tsx`                                      |
| React 18의 `RefObject.current`가 읽기 전용(`current` 대입)       |    3 | `useChildNodeComponents.tsx` 2, `RootNodeContextProvider.tsx` 1                     |
| React 18의 `RefObject<T>.current`가 `T \| null`(null 가능성)     |    5 | `useFormTypeInputControl.ts` 3, `RootNodeContextProvider.tsx` 1, `useLiveNode.ts` 1 |
| `RefObject<T \| null \| undefined>`를 `RefObject<T>` 자리에 넘김 |    2 | `SchemaNodeInputWrapper.tsx`                                                        |

개선-37 전에도 이 검사는 3건(`SubmitEvent` 1, `SchemaNodeInputWrapper.tsx` 2)으로 실패했습니다. 나머지 8건은 개선-37이 지원 종료된 `MutableRefObject`를 React 19에서 같은 뜻인 `RefObject`로 바꾸면서 생겼습니다. React 19에서는 `RefObject.current`가 쓰기 가능하고 null을 더하지 않으므로, React 19 형에서는 오류가 없습니다.

## 판단

React 18 소비자는 배포된 d.ts를 컴파일합니다. 그 d.ts는 개선-37 전후가 같으므로 소비자 표면에는 영향이 없습니다. 내부 소스를 React 18 형으로도 통과시키려면 React 18과 19에서 뜻이 같은 ref 형이 필요합니다. React가 제공하는 형 가운데 그런 것은 지원 종료된 `MutableRefObject`뿐이고, 직접 `{ current: T }` 형을 만들어 쓰는 것은 "지원 종료 형은 동치의 호환성 형으로" 바꾼 개선-37의 방향과 다른 결정입니다. 그래서 고치지 않고 이 검사를 기록으로 둡니다. 다시 볼 시점은 React 18 형 지원 범위를 정할 때입니다.
