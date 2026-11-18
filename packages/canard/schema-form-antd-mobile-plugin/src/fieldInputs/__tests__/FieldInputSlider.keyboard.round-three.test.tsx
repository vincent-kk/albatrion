import {createRef} from 'react';
import {cleanup,fireEvent,render} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {Form,type FormHandle} from '@canard/schema-form';
import {FieldInputSliderDefinition} from '../FieldInputSlider';
afterEach(cleanup);
it.each([['ArrowRight',6],['ArrowUp',6],['ArrowLeft',4],['ArrowDown',4],['Home',0],['End',10],['PageUp',10],['PageDown',0]])('supports %s without pointer input',(key,expected)=>{
 const ref=createRef<FormHandle>();const view=render(<Form ref={ref} fieldInputDefinitions={[FieldInputSliderDefinition]} jsonSchema={{type:'number',format:'slider',minimum:0,maximum:10,multipleOf:1}} defaultValue={5}/>);
 fireEvent.keyDown(view.container.querySelector('[role="slider"]')!,{key});
 expect(ref.current!.getValue()).toBe(expected);
});
it('keeps each keyboard-operated range thumb within its neighbours',()=>{
 const ref=createRef<FormHandle>();const view=render(<Form ref={ref} fieldInputDefinitions={[FieldInputSliderDefinition]} jsonSchema={{type:'array',format:'slider',items:{type:'number',minimum:0,maximum:10,multipleOf:1}}} defaultValue={[2,8]}/>);
 const thumbs=view.container.querySelectorAll('[role="slider"]');
 fireEvent.keyDown(thumbs[0],{key:'End'});expect(ref.current!.getValue()).toEqual([8,8]);
 fireEvent.keyDown(thumbs[1],{key:'Home'});expect(ref.current!.getValue()).toEqual([8,8]);
});
it.each(['disabled','readOnly'])('does not change a %s slider with the keyboard',lock=>{
 const ref=createRef<FormHandle>();const view=render(<Form ref={ref} fieldInputDefinitions={[FieldInputSliderDefinition]} jsonSchema={{type:'number',format:'slider',minimum:0,maximum:10,[lock]:true}} defaultValue={5}/>);
 fireEvent.keyDown(view.container.querySelector('[role="slider"]')!,{key:'ArrowRight'});
 expect(ref.current!.getValue()).toBe(5);
});
