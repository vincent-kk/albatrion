export const smallCss = `
/* 컴포넌트 ${Math.random()} */
.component-${Math.floor(Math.random() * 1000)} {
    background: linear-gradient(${Math.floor(Math.random() * 360)}deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)});
    padding:    ${Math.floor(Math.random() * 50)}px   ${Math.floor(Math.random() * 50)}px  ;
    margin: ${Math.floor(Math.random() * 20)}px;;;;;;;;
    
    border-radius:   ${Math.floor(Math.random() * 20)}px  ;
    transition: all ${Math.random().toFixed(1)}s ease-in-out   ;
}

.nested-selector > .child:nth-child(${Math.floor(Math.random() * 10) + 1}) {
    color:    #${Math.floor(Math.random() * 16777215).toString(16)}   ;
    font-size: ${Math.floor(Math.random() * 20) + 10}px;;;;
    text-transform: uppercase  ; /* 변환 속성 */
}

@media (max-width: ${Math.floor(Math.random() * 500) + 500}px) {
    .responsive-${Math.floor(Math.random() * 100)} {
        display: none   ;
        opacity: ${Math.random().toFixed(2)};;;
    }
}
`;

export const largeCss = `/* 복잡한 CSS 샘플 */
.header-navigation {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    padding:    20px   30px  ;
    margin: 0    auto;;;;
    
    border-radius:   10px  ;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)   ;
}

/* 중첩된 주석
   여러 줄에 걸친 주석
   특수문자: {}[]() */
.complex-selector[data-attribute="value"] > .child:nth-child(2n+1) {
    content: "/* 이건 주석이 아님 */";
    font-family: "Times New Roman", serif;;;
    animation: fadeIn 0.3s ease-in-out;;;;;;
    
    transform: translateX(10px)   rotateY(45deg)  ;
}

@media screen and (max-width: 768px) {
    .responsive-element {
        display: flex   ;
        justify-content:    space-between   ;
        align-items: center  ; /* 정렬 */
    }
    
    .mobile-only { display: block; }
}

/* 특수 케이스들 */
.utility { color: red; }
.another-class { 
    background: url("data:image/svg+xml;base64,PHN2Z...");
    content: "문자열 /* 가짜 주석 */ 내용";
}`;
