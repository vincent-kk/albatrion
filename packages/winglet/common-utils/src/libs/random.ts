/**
 * 랜덤 문자열을 생성하는 함수
 * Math.random()을 사용하여 랜덤 문자열 생성
 * @param radix - 변환할 진수
 * @returns 난수를 진수로 변환한 문자열 (소수점 이후 부분)
 */
export const getRandomString = (radix?: number) =>
  Math.random().toString(radix).slice(2);

/**
 * 주어진 범위 내의 랜덤 정수를 생성하는 함수
 * @param min - 최소값(포함)
 * @param max - 최대값(포함)
 * @returns min과 max 사이의 랜덤 정수
 */
export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 랜덤 부울 값을 생성하는 함수
 * @returns 50% 확률로 true 또는 false
 */
export const getRandomBoolean = () => Math.random() < 0.5;
