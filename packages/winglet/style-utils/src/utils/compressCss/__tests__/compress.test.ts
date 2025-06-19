import { describe, expect, it } from 'vitest';

import { compressCss } from '../compressCss';

describe('compressCss', () => {
  it('빈 문자열에 대해 빈 문자열을 반환해야 합니다', () => {
    const result = compressCss('');
    expect(result).toBe('');
  });

  it('단순한 CSS 규칙을 압축해야 합니다', () => {
    const input = `
      .class {
        color: red;
        background: blue;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe('.class{color:red;background:blue}');
  });

  it('여러 공백과 줄바꿈을 제거해야 합니다', () => {
    const input = `
      .class1   {
        color  :   red  ;
        margin :  10px   20px  ;
      }
      
      .class2    {
        padding:   5px;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe(
      '.class1{color:red;margin:10px 20px}.class2{padding:5px}',
    );
  });

  it('CSS 주석을 제거해야 합니다', () => {
    const input = `
      /* 이것은 주석입니다 */
      .class {
        color: red; /* 인라인 주석 */
        background: blue;
      }
      /* 또 다른 주석 */
    `;
    const result = compressCss(input);
    expect(result).toBe('.class{color:red;background:blue}');
  });

  it('여러 줄 주석을 올바르게 처리해야 합니다', () => {
    const input = `
      /*
       * 여러 줄 주석
       * 테스트
       */
      .class {
        color: red;
        /*
         * 또 다른 여러 줄 주석
         */
        background: blue;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe('.class{color:red;background:blue}');
  });

  it('불필요한 세미콜론을 제거해야 합니다', () => {
    const input = `
      .class {
        color: red;;
        background: blue;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe('.class{color:red;background:blue}');
  });

  it('중첩된 CSS 규칙을 처리해야 합니다', () => {
    const input = `
      .parent {
        color: red;
      }
      .parent .child {
        background: blue;
        margin: 10px;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe(
      '.parent{color:red}.parent .child{background:blue;margin:10px}',
    );
  });

  it('CSS 선택자의 공백을 적절히 유지해야 합니다', () => {
    const input = `
      .class1   .class2   >   .class3 {
        color: red;
      }
      
      .class4   +   .class5 {
        margin: 0;
      }
    `;
    const result = compressCss(input);
    expect(result).toBe(
      '.class1 .class2>.class3{color:red}.class4+.class5{margin:0}',
    );
  });

  it('미디어 쿼리를 올바르게 처리해야 합니다', () => {
    const input = `
      @media screen and (max-width: 768px) {
        .class {
          display: none;
        }
      }
    `;
    const result = compressCss(input);
    expect(result).toBe(
      '@media screen and (max-width:768px){.class{display:none}}',
    );
  });

  it('keyframes를 올바르게 처리해야 합니다', () => {
    const input = `
      @keyframes fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `;
    const result = compressCss(input);
    expect(result).toBe('@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}');
  });

  it('주석이 포함된 복잡한 CSS를 처리해야 합니다', () => {
    const input = `
      /* 전역 스타일 */
      .container {
        width: 100%;
        max-width: 1200px; /* 최대 너비 제한 */
        margin: 0 auto;
      }
      
      /* 반응형 디자인 */
      @media (max-width: 768px) {
        .container {
          padding: 0 16px; /* 모바일 패딩 */
        }
      }
    `;
    const result = compressCss(input);
    expect(result).toBe(
      '.container{width:100%;max-width:1200px;margin:0 auto}@media (max-width:768px){.container{padding:0 16px }}',
    );
  });
});
