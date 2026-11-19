# 네이티브 검증 연결 계약

## Requirements

주입한 인스턴스의 검증 의미를 보존하며 폼의 루트 수명은 애플리케이션의 스키마 등록 수명과 구별합니다.

## API Contracts

키워드가 던지거나 거부한 값은 컴파일에 사용하는 AJV 인스턴스의 생성자가 제공하는 ValidationError의 인스턴스일 때만 검증 issue로 변환합니다. errors라는 속성이나 AJV 표지 속성은 클래스의 정체성을 대신하지 않습니다. 다른 오류와 오류가 아닌 값은 같은 값으로 호출자에게 전달하여 실행 실패를 검증 실패로 숨기지 않습니다. 별도 설치된 같은 AJV 버전의 인스턴스를 주입해도 그 생성자의 ValidationError를 사용하므로 설치 사본에 따라 의미가 바뀌지 않습니다.

## Acceptance Criteria

### keyword-exception-identity — 실행 오류와 검증 실패를 구별합니다

- 동기·비동기 키워드와 공개 진입점에서 네이티브 ValidationError만 issue로 변환합니다.
- errors 배열·배열이 아닌 errors·표지를 가진 일반 객체는 같은 값으로 거부합니다.
- 다른 설치 사본의 AJV 인스턴스도 자기 네이티브 오류를 인식합니다.

## Last Updated

공개 검증 의미 또는 등록 수명의 경계가 바뀔 때 갱신합니다.
