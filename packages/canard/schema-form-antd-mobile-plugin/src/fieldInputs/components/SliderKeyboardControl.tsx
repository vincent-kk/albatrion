import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { getKeyboardValue } from '../utils/slider/getKeyboardValue';

/** Keyboard adapter for library thumbs that expose ARIA but no native keyboard input. */
interface SliderKeyboardControlProps {
  /** Library slider whose thumb nodes remain stable during value changes. */
  children: ReactNode;
  /** Current draft value, updated on pointer moves as well as keyboard input. */
  value: number | [number, number];
  /** Inclusive bounds and step from the numeric schema. */
  min: number;
  max: number;
  step: number;
  /** Sorted mark positions, or an empty list for ordinary stepping. */
  stops: readonly number[];
  /** Whether focus and changes are blocked. */
  disabled: boolean;
  /** Commit keyboard input through the same conversion as pointer input. */
  onChange: (value: number | [number, number]) => void;
}

/**
 * Make the library's thumb nodes keyboard reachable without adding another visible control.
 * @param props - Slider child, current value and numeric navigation constraints.
 * @returns An event boundary that marks and operates each existing thumb.
 */
export const SliderKeyboardControl = ({children,value,min,max,step,stops,disabled,onChange}: SliderKeyboardControlProps) => {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    for(const thumb of ref.current?.querySelectorAll<HTMLElement>('[role="slider"]') ?? []) {
      thumb.tabIndex=disabled ? -1 : 0;
      if(disabled) thumb.removeAttribute('data-focus-target');
      else thumb.setAttribute('data-focus-target','');
    }
  },[disabled]);
  const handleKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(disabled) return;
    const index=Array.from(ref.current?.querySelectorAll('[role="slider"]') ?? []).findIndex(thumb=>thumb===event.target);
    if(index<0) return;
    const range=Array.isArray(value);
    const current=range ? value[index] : value;
    const lower=range && index===1 ? value[0] : min;
    const upper=range && index===0 ? value[1] : max;
    const next=getKeyboardValue(event.key,current,lower,upper,step,stops);
    if(next===undefined) return;
    event.preventDefault();
    onChange(range ? index===0 ? [next,value[1]] : [value[0],next] : next);
  };
  return <div ref={ref} style={{display:'contents'}} onKeyDown={handleKeyDown}>{children}</div>;
};
