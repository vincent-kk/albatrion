import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { Form, FormProvider, ValidationMode, SetValueOption, registerPlugin, useChildFieldMap, isArrayNode, type FormHandle } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/index';
import { nodeFromJSONSchema } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/__tests__/fixtures/nodeFromJSONSchema';
import { replaceExpressionPaths } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/core/engine/blueprint/utils/expressions/replaceExpressionPaths';
import { areContextsEqual } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/providers/hooks/contextSnapshot/utils/areContextsEqual';
import { resolvePointer } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/helpers/jsonPointer/utils/resolvePointer';
import { blueprint } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/core/engine/blueprint/blueprint';

import { relayFieldNodeInput } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/core/surface/utils/binding/relayFieldNodeInput';
import { createValidationScope } from '/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src/core/engine/validation/utils/route/createValidationScope';
const scalar = {type:'object',properties:{name:{type:'string'},age:{type:'number'}}} as const;
const derived = {type:'object',properties:{a:{type:'number'},b:{type:'number',controls:{derived:'../a * 2'}}}} as const;
const radio = {type:'object',properties:{kind:{type:'string',enum:['a','b','c'],presentation:{inputType:'radio'}}}} as const;
const listSchema = {type:'object',properties:{list:{type:'array',items:radio}}} as const;
const hundred = {type:'object',properties:Object.fromEntries(Array.from({length:100},(_,i)=>['f'+i,{type:'string'}]))};
const virtualSchema = {type:'object',properties:{start:{type:'string'},end:{type:'string'},note:{type:'string'}},options:{virtual:{period:{fields:['start','end']}}}};
const refSchema = {type:'object',$defs:{entry:{type:'object',properties:{name:{type:'string'}}}},properties:{one:{$ref:'#/$defs/entry'},two:{$ref:'#/$defs/entry'}}};
let sink: unknown;

export function initialize() {
  const host=document.createElement('div'); document.body.append(host);
  const client=createRoot(host);
  flushSync(()=>client.render(<><Form jsonSchema={scalar} validationMode={ValidationMode.None}/><Form jsonSchema={derived} validationMode={ValidationMode.None}/><Form jsonSchema={listSchema} defaultValue={{list:[{kind:'a'},{kind:'b'}]}} validationMode={ValidationMode.None}/><Form jsonSchema={refSchema} validationMode={ValidationMode.None}/></>));
  if(host.querySelectorAll('form').length!==4)throw Error('Expected four initialized client forms');
  return ()=>flushSync(()=>client.unmount());
}

// Focused rows for open items A and B: ab-<batch|seq>-<kind>-<n>.
// kind plain: n caller writes, no declarative rule; idle: an injectTo rule is declared but not triggered;
// scalar: one declarative scalar write; object: one declarative object write (two leaves);
// object50: one declarative write of an object with 50 descendants; tuple: a virtual group same-tuple write.
function prepareAb(row: string): {run:(i:number)=>unknown; count:number; observe?:()=>unknown} {
  // ab-derive-overlap: one write whose rule returns two winners on overlapping targets (an object and
  // a field inside it); ab-derive-disjoint: two winners on separate scalar targets, the common case.
  if (row === 'ab-derive-overlap' || row === 'ab-derive-disjoint' || row === 'ab-derive-overlap-restore') {
    const overlap = row !== 'ab-derive-disjoint';
    const restoresCurrent = row === 'ab-derive-overlap-restore';
    const schema = {type:'object', properties:{
      src:{type:'string', controls:{injectTo:(v: unknown) => typeof v !== 'string' ? {} : overlap ? {'../obj':{a:v, b:v}, '../obj/b':restoresCurrent ? 'keep' : v + '!'} : {'../p':v, '../q':v + '!'}}},
      p:{type:'string'}, q:{type:'string'},
      obj:{type:'object', properties:{a:{type:'string'}, b:{type:'string'}}},
    }};
    const root = nodeFromJSONSchema({jsonSchema:schema as never, defaultValue:restoresCurrent ? { obj: { b: 'keep' } } : {}, validationMode:ValidationMode.None});
    const src = root.find('/src');
    if (restoresCurrent) {
      const restored = root.find('/obj/b');
      return {run:i => {
        restored.setValue('keep', SetValueOption.DisableAutomaticWrites);
        src.setValue('s' + i);
      }, observe: () => root.value, count:6000};
    }
    return {run:i => src.setValue('s' + i), observe: () => root.value, count:10000};
  }
  // ab-reset-pending: eight unrelated caller writes then a subtree reset in one batch, which now
  // settles the writes before the load; ab-reset-only: a batch whose only call is the reset.
  if (row === 'ab-reset-pending' || row === 'ab-reset-only') {
    const props: Record<string, unknown> = {obj:{type:'object', properties:{a:{type:'string'}, b:{type:'string'}}}};
    for (let k = 0; k < 8; k++) props['f' + k] = {type:'string'};
    const root = nodeFromJSONSchema({jsonSchema:{type:'object', properties:props} as never, defaultValue:{obj:{a:'x', b:'y'}}, validationMode:ValidationMode.None});
    const fields = Array.from({length:8}, (_, k) => root.find('/f' + k));
    const obj = root.find('/obj');
    const pending = row === 'ab-reset-pending';
    return {run:i => root.batch(() => {
      if (pending) for (let k = 0; k < 8; k++) fields[k].setValue('v' + i + '_' + k);
      obj.resetSubtree();
    }), count:pending ? 3000 : 12000};
  }
  const [, mode, kind, size] = row.split('-');
  const n = Number(size);
  const props: Record<string, unknown> = {};
  for (let k = 0; k < n; k++) props['f' + k] = {type:'string'};
  const big = (v: string) => Object.fromEntries(Array.from({length:5}, (_, g) => ['g' + g, Object.fromEntries(Array.from({length:9}, (_, l) => ['l' + l, v + g + l]))]));
  if (kind !== 'plain' && kind !== 'tuple') {
    props.src = {type:'string', controls:{injectTo:(v: unknown) => typeof v !== 'string' ? {} : kind === 'object' ? {'../obj': {a: v, b: v}} : kind === 'object50' ? {'../big': big(v)} : {'../target': v}}};
    props.target = {type:'string'};
    props.obj = {type:'object', properties:{a:{type:'string'}, b:{type:'string'}}};
    props.big = {type:'object', properties:Object.fromEntries(Array.from({length:5}, (_, g) => ['g' + g, {type:'object', properties:Object.fromEntries(Array.from({length:9}, (_, l) => ['l' + l, {type:'string'}]))}]))};
  }
  if (kind === 'tuple') {
    props.t1 = {type:'string'};
    props.t2 = {type:'object', properties:{x:{type:'string'}}};
  }
  const schema = {type:'object', properties:props, ...(kind === 'tuple' ? {options:{virtual:{group:{fields:['t1','t2']}}}} : {})};
  const defaultValue: Record<string, unknown> = kind === 'tuple' ? {t1:'a', t2:{x:'b'}} : {};
  const root = nodeFromJSONSchema({jsonSchema:schema as never, defaultValue, validationMode:ValidationMode.None});
  const fields = Array.from({length:n}, (_, k) => root.find('/f' + k));
  const src = root.find('/src'), group = root.find('/group');
  const triggers = kind === 'scalar' || kind === 'object' || kind === 'object50';
  const calls = (i: number) => {
    for (let k = 0; k < n; k++) fields[k].setValue('v' + i + '_' + k);
    if (triggers) src.setValue('s' + i);
    if (kind === 'tuple') group.setValue(group.value);
  };
  const perCall = n + (triggers ? 1 : 0);
  return mode === 'batch'
    ? {run:i => root.batch(() => calls(i)), count:Math.max(200, Math.round(24000 / perCall))}
    : {run:calls, count:Math.max(100, Math.round(12000 / perCall))};
}

function preparePlain(row: string) {
  const width = row.includes('50') ? 50 : 2;
  const properties = Object.fromEntries(
    Array.from({ length: width }, (_, index) => ['k' + index, { type: 'number' }]),
  );
  const values = [0, 1].map((value) =>
    Object.fromEntries(Array.from({ length: width }, (_, index) => ['k' + index, value + index])),
  );
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties },
    defaultValue: values[0],
    validationMode: ValidationMode.None,
  });
  const leaf = root.find('/k0');
  const other = root.find('/k1');
  if (row === 'plain-empty') return { run: () => root.batch(() => {}), count: 20000 };
  if (row === 'plain-scalar') return { run: (index) => leaf.setValue(index & 1), count: 20000 };
  if (row === 'plain-same') return { run: () => leaf.setValue(0), count: 20000 };
  if (row === 'plain-nested')
    return {
      run: (index) => root.batch(() => root.batch(() => {
        leaf.setValue(index & 1);
        other.setValue(index & 1);
      })),
      count: 12000,
    };
  const option = row.includes('merge') ? SetValueOption.Merge : SetValueOption.Overwrite;
  return { run: (index) => root.setValue(values[index & 1], option), count: width === 50 ? 3000 : 10000 };
}

function prepareExit(row: string) {
  const depth = row.endsWith('16') ? 16 : 4;
  let schema = { type: 'string' };
  let defaultValue = 'initial';
  for (let level = 0; level < depth; level++) {
    schema = { type: 'object', properties: { n: schema } };
    defaultValue = { n: defaultValue };
  }
  const target = '../o' + '/n'.repeat(depth);
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        o: { ...schema, controls: { active: '/on === true' } },
        src: {
          type: 'string',
          controls: { injectTo: (value) => ({ [target]: value, '../on': false }) },
        },
      },
    },
    defaultValue: { on: true, o: defaultValue },
    validationMode: ValidationMode.None,
  });
  const on = root.find('/on');
  const src = root.find('/src');
  return {
    run: (index) => {
      on.setValue(true);
      src.setValue('v' + (index & 1));
    },
    count: 2000,
  };
}

function prepareArrayOverlap(row: string) {
  const [, , widthText, overlapText] = row.split('-');
  const width = Number(widthText), overlaps = Number(overlapText);
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'string' } },
        trigger: {
          type: 'string',
          controls: {
            injectTo: (value) => {
              if (typeof value !== 'string') return {};
              const effects = {
                '../list': Array.from({ length: width }, (_, index) => value + index),
              };
              for (let index = 0; index < overlaps; index++)
                effects['../list/' + index] = value + ':' + index;
              return effects;
            },
          },
        },
      },
    },
    defaultValue: { list: Array.from({ length: width }, (_, index) => 'old:' + index) },
    validationMode: ValidationMode.None,
  });
  const trigger = root.find('/trigger');
  return { run: (index) => trigger.setValue('version' + (index & 1)), count: 500 };
}

export function prepare(row: string): {run:(i:number)=>unknown; count:number; cleanup?:()=>void; observe?:()=>unknown} {
  if (row === 'retained-perished') {
    const initial = { on: true, otherOn: true, other: 'old', list: [{ y: 'old' }], start: false, trim: false, grow: false };
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object', properties: {
          on: { type: 'boolean' },
          otherOn: { type: 'boolean' },
          other: { type: 'string', controls: { active: '/otherOn === true' } },
          start: { type: 'boolean', controls: { injectTo: (on) => on ? { '../list/0/y': 'stale', '../trim': true } : {} } },
          trim: { type: 'boolean', controls: { injectTo: (on) => on ? { '../list': [], '../grow': true } : {} } },
          grow: { type: 'boolean', controls: { injectTo: (on) => on ? { '../list': [{}], '../otherOn': false } : {} } },
          list: { type: 'array', items: { type: 'object', properties: { y: { type: 'string', controls: { active: '/on === true' } } } } },
        },
      },
      defaultValue: initial,
      validationMode: ValidationMode.None,
    });
    return {
      run: () => {
        root.setValue(initial, SetValueOption.DisableAutomaticWrites);
        root.setValue({ on: false, start: true }, SetValueOption.Merge);
      },
      observe: () => root.inactiveValues,
      count: 700,
    };
  }
  if (row === 'retained-budget') {
    const route = 'parent', secondRevival = () => undefined;
    return { count: 80, run: () => {
      const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        options: { virtual: { group: { fields: ['o'] } } },
        properties: {
          on: { type: 'boolean' },
          caller: { type: 'string' },
          write: {
            type: 'boolean',
            controls: {
              injectTo: (value) => {
                if (!value) return {};
                if (route === 'own')
                  return {
                    '../o/y': 'revived',
                    '../o/list': ['new', 'extra'],
                    '../o/held': 'held1',
                  };
                const input = {
                  y: 'revived',
                  list: ['new', 'extra'],
                  held: 'held1',
                };
                return route === 'parent'
                  ? { '../o': input }
                  : { '../group': [input] };
              },
            },
          },
          reopen: {
            type: 'boolean',
            controls: {
              injectTo: (value) => (value ? { '../on': true } : {}),
            },
          },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: {
              y: { type: 'string' },
              list: { type: 'array', items: { type: 'string' } },
              held: { type: 'string', controls: { active: '/hold === true' } },
            },
          },
          hold: { type: 'boolean' },
          closeAgain: {
            type: 'boolean',
            controls: {
              derived: '/o/y === "revived" ? true : /closeAgain',
              injectTo: (value) => (value ? { '../on': false } : {}),
            },
          },
          reopenAgain: {
            type: 'boolean',
            controls: {
              derived:
                '/closeAgain === true && /on === false ? true : /reopenAgain',
              injectTo: (value) => (value ? { '../on': true } : {}),
            },
          },
          startCycle: {
            type: 'boolean',
            controls: {
              derived:
                '/reopenAgain === true && /o/y === "revived" ? true : /startCycle',
              injectTo: (value) => {
                if (!value) return {};
                secondRevival();
                return {
                  '../on': false,
                  '../o/list': [],
                  '../o/held': 'held2',
                };
              },
            },
          },
          startAfterExit: {
            type: 'boolean',
            controls: {
              derived:
                '/startCycle === true && /on === false ? true : /startAfterExit',
              injectTo: (value) => (value ? { '../ping': 'cycle' } : {}),
            },
          },
          ping: {
            type: 'string',
            controls: {
              injectTo: (value) =>
                typeof value === 'string' ? { '../pong': value + '1' } : {},
            },
          },
          pong: {
            type: 'string',
            controls: {
              injectTo: (value) =>
                typeof value === 'string' ? { '../ping': value + '2' } : {},
            },
          },
        },
      },
      defaultValue: {
        on: true,
        o: { y: 'old', list: ['list0'], held: 'held0' },
      },
      validationMode: ValidationMode.None,
    });
      try { root.setValue({on:false,caller:'kept',write:true,reopen:true}, SetValueOption.Merge); }
      catch (error) { sink = error.code; }
    } };
  }
  if (row === 'retained-reentry') {
    return { count: 350, run: () => {
      const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        show: { type: 'boolean' },
        write: {
          type: 'boolean',
          controls: {
            injectTo: (value) =>
              value ? { '../o': { y: 'revived', held: 'early' } } : {},
          },
        },
        reopen: {
          type: 'boolean',
          controls: {
            injectTo: (value) => (value ? { '../on': true } : {}),
          },
        },
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: {
            y: { type: 'string' },
            held: { type: 'string', controls: { active: '/show === true' } },
          },
        },
        finish: {
          type: 'boolean',
          controls: {
            derived: '/o/y === "revived" ? true : /finish',
            injectTo: (value) =>
              value
                ? { '../on': false, '../o': { y: 'latest', held: 'late' } }
                : {},
          },
        },
      },
    },
    defaultValue: { on: true, o: { y: 'old', held: 'held0' } },
    validationMode: ValidationMode.None,
  });
      root.setValue({on:false,write:true,reopen:true}, SetValueOption.Merge);
      sink = root.inactiveValues;
    } };
  }
  if (row === 'retained-generation') {
    return { count: 350, run: () => {
      const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        kind: { type: 'string' },
        start: {
          type: 'boolean',
          controls: {
            injectTo: (value) => (value ? { '../o': { z: 'middle' } } : {}),
          },
        },
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: {
            z: { type: 'string' },
            list: {
              type: 'array',
              allOf: [
                {
                  controls: { active: '/kind === "text"' },
                  items: { type: 'string' },
                },
                {
                  controls: { active: '/kind === "number"' },
                  items: { type: 'number' },
                },
              ],
            },
          },
        },
        finish: {
          type: 'boolean',
          controls: {
            derived: '/o/z === "middle" ? true : /finish',
            injectTo: (value) =>
              value ? { '../o/list': ['latest'], '../on': false } : {},
          },
        },
      },
    },
    defaultValue: { on: true, kind: 'number', o: { list: [7] } },
    validationMode: ValidationMode.None,
  });
      root.find('/kind').setValue('text');
      root.find('/kind').setValue('number');
      root.find('/kind').setValue('text');
      root.find('/start').setValue(true);
      root.setValue({on:true,kind:'number'}, SetValueOption.Merge);
      sink = root.find('/o/list/0')?.value;
    } };
  }


  if (row === 'reset-refused-8' || row === 'reset-refused-sequential-8') {
    const fields = Object.fromEntries(Array.from({length:7}, (_, i) => ['f'+i, {type:'string'}]));
    const schema = {type:'object', properties:{...fields,on:{type:'boolean'},box:{
      type:'object', controls:{active:'/on === true'}, properties:{x:{type:'string'},y:{type:'string'}}
    }}};
    const root = nodeFromJSONSchema({jsonSchema:schema as never,defaultValue:{on:true,box:{x:'old',y:'old'}},validationMode:ValidationMode.None});
    const on = root.find('/on');
    const siblings = Array.from({length:7}, (_,i) => root.find('/f'+i));
    return {count:3000, run:i=>{
      on.setValue(true);
      const box = root.find('/box');
      if (row === 'reset-refused-sequential-8') {
        box.setValue({x:'last',y:'early'});
        for (const field of siblings) field.setValue('f'+i);
        on.setValue(false);
        return box.resetSubtree();
      }
      return root.batch(()=>{
        box.setValue({x:'early',y:'early'});
        for (const field of siblings) field.setValue('f'+i);
        root.setValue({on:false,box:{x:'last'}},SetValueOption.Merge);
        box.resetSubtree();
      });
    }};
  }
  if (row === 'virtual-merge-one' || row === 'virtual-absent-undefined') {
    const hasAbsent = row === 'virtual-absent-undefined';
    const schema = {type:'object',properties:{box:{type:'object',properties:{
      x:{type:'string'},y:{type:'string'}
    }}, hidden:{type:'string',controls:{active:'false'}},f:{type:'string'}},
    options:{virtual:{group:{fields:hasAbsent?['box','hidden']:['box']}}}};
    const root = nodeFromJSONSchema({jsonSchema:schema as never,defaultValue:{box:{x:'a',y:'b'}},validationMode:ValidationMode.None});
    const group = root.find('/group'), field = root.find('/f');
    return {count:6000,run:i=>root.batch(()=>{
      const value = hasAbsent ? [{x:String(i)},undefined] : [{x:String(i)}];
      group.setValue(value, SetValueOption.Merge);
      field.setValue(String(i));
    })};
  }
  if (row === 'branch-null') {
    const root = nodeFromJSONSchema({jsonSchema:{type:'object',properties:{box:{type:['object','null'],properties:{x:{type:'string'}}}}},defaultValue:{box:null},validationMode:ValidationMode.None});
    const box = root.find('/box');
    return {count:15000,run:()=>box.setValue(null)};
  }
  if (row.startsWith('plain-')) return preparePlain(row);
  if (row.startsWith('deep-exit-')) return prepareExit(row);
  if (row.startsWith('overlap-array-')) return prepareArrayOverlap(row);
  if (row.startsWith('ab-')) return prepareAb(row);
  if(['default-value','divergence','inactive-read','virtual-write','virtual-getters','virtual-getter-default','virtual-getter-divergence','virtual-getter-inactive'].includes(row)) {
    const root=nodeFromJSONSchema({jsonSchema:virtualSchema,defaultValue:{start:'a',end:'b',note:'n'},validationMode:ValidationMode.None});
    const field=root.find('/start'), group=root.find('/period');
    if(row==='default-value')return {run:()=>sink=field.defaultValue,count:200000};
    if(row==='divergence')return {run:()=>sink=field.isDivergent,count:200000};
    if(row==='inactive-read')return {run:()=>sink=root.inactiveValues,count:200000};
    if(row==='virtual-getters')return {run:()=>sink=[group.defaultValue,group.isDivergent,group.inactiveValues],count:100000};
    if(row==='virtual-getter-default')return {run:()=>sink=group.defaultValue,count:300000};
    if(row==='virtual-getter-divergence')return {run:()=>sink=group.isDivergent,count:300000};
    if(row==='virtual-getter-inactive')return {run:()=>sink=group.inactiveValues,count:300000};
    return {run:i=>group.setValue(['a'+i,'b'+i]),count:10000};
  }
  if(row==='compile-resource') {const schema={$id:'https://example.test/root.json',type:'object',$defs:{Resource:{$id:'nested.json',type:'object',$defs:{X:{type:'string',default:'inner'}},properties:{value:{$ref:'#/$defs/X'}}}},properties:{entry:{$ref:'#/$defs/Resource'}}};return {run:()=>sink=blueprint(schema,{collect:()=>{}}),count:5000};}
  if(row==='branch-nonnull') {const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{branch:{type:['object','null'],properties:{a:{type:'number'}}}}},defaultValue:{branch:null},validationMode:ValidationMode.None});const branch=root.find('/branch');return {run:i=>branch.setValue(i%2?{a:i}:null),count:15000};}
  if(row==='react-bridges') {const ref=React.createRef<FormHandle>();const host=document.createElement('div');document.body.append(host);const client=createRoot(host);flushSync(()=>client.render(<Form ref={ref} jsonSchema={scalar} defaultValue={{name:'n',age:2}} validationMode={ValidationMode.None}/>));const node=ref.current.findNode('/name');return {run:i=>flushSync(()=>node.setValue('value-'+i)),count:1500,cleanup:()=>{flushSync(()=>client.unmount());host.remove()}};}
  if(row==='scalar-batch') {const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'number'},b:{type:'number'}}},defaultValue:{a:1,b:2},validationMode:ValidationMode.None});const a=root.find('/a'),b=root.find('/b');return {run:i=>root.batch(()=>{a.setValue(i);b.setValue(i+1)}),count:20000};}
  if(row==='batch-merge') {const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{obj:{type:'object',properties:{a:{type:'number'},b:{type:'number'}}},other:{type:'number'}}},defaultValue:{obj:{a:1,b:2},other:1},validationMode:ValidationMode.None});const obj=root.find('/obj'),other=root.find('/other');return {run:i=>root.batch(()=>{obj.setValue({a:i},SetValueOption.Merge);other.setValue(i)}),count:12000};}
  if(row==='validation-scope') {const root=nodeFromJSONSchema({jsonSchema:derived,defaultValue:{a:1},validationMode:ValidationMode.None});const target=root.find('/a'),other=root.find('/b');return {run:()=>{const contains=createValidationScope([target]);sink=[contains(target),contains(other)]},count:300000};}
  if(row==='child-map-render') { const Group=({ChildFields})=>{const fields=useChildFieldMap(ChildFields??[]);const Name=fields.name;return <Name/>}; return {run:()=>sink=renderToString(<Form jsonSchema={scalar} fieldInputMap={{'':Group}} validationMode={ValidationMode.None}/>),count:1000}; }
  if(row==='radio-client') { const ref=React.createRef<FormHandle>();const host=document.createElement('div');document.body.append(host);const client=createRoot(host);flushSync(()=>client.render(<Form ref={ref} jsonSchema={listSchema} defaultValue={{list:[{kind:'a'},{kind:'b'}]}} validationMode={ValidationMode.None}/>));const list=ref.current?.findNode('/list');if(!isArrayNode(list))throw Error('array');return {run:()=>{flushSync(()=>list.push({kind:'c'}));flushSync(()=>list.pop())},count:300,cleanup:()=>{flushSync(()=>client.unmount());host.remove()}}; }
  if(row==='context-builtin') {
    const a={error:Object.assign(new Error('same'),{data:{value:1}}),box:Object.assign(Object(1),{data:{value:1}})};
    const b={error:Object.assign(new Error('same'),{data:{value:1}}),box:Object.assign(Object(1),{data:{value:1}})};
    return {run:()=>sink=areContextsEqual(a,b),count:100000};
  }
  if(row==='context-update') {
    const a={user:{name:'n',roles:['a','b']},map:new Map([['x',{active:true}]])};
    const b={user:{name:'n',roles:['a','b']},map:new Map([['x',{active:true}]])};
    return {run:()=>sink=areContextsEqual(a,b),count:120000};
  }
  if(row==='expr-scan'||row==='expr-division') return {run:()=>sink=replaceExpressionPaths(row==='expr-scan'?'../a + "../literal" + /^\\d+$/.test(../name)':'../a / 100 + ../b',p=>'value'),count:100000};
  if(row==='pointer-resolve') return {run:()=>sink=resolvePointer('/obj/item','../name'),count:150000};
  if(row==='compile-root-ref'||row==='compile-warnings') return {run:()=>sink=blueprint(row==='compile-root-ref'?refSchema:{type:'object',allOf:[{not:{required:['x']}}]},{collect:()=>{}}),count:row==='compile-warnings'?30000:5000};
  if(row==='register-plugin') return {run:()=>{registerPlugin({});registerPlugin(null)},count:30000};
  if(row==='mount-100'||row==='mount-plain'||row==='radio-options'||row==='provider-render'||row==='react-bridges') {
    const schema=row==='mount-100'?hundred:row==='radio-options'?{type:'object',properties:{kind:{type:'string',enum:Array.from({length:100},(_,i)=>'option-'+i),presentation:{inputType:'radio'}}}}:scalar;
    return {run:i=>sink=renderToString(row==='provider-render'?<FormProvider><FormProvider><Form jsonSchema={schema} validationMode={ValidationMode.None}/></FormProvider></FormProvider>:<Form jsonSchema={schema} defaultValue={{name:'n',age:2}} validationMode={ValidationMode.None}/>),count:row==='mount-100'||row==='radio-options'?150:1000};
  }
  if(row==='wildcard-5000'||row==='wildcard-20000') {
    const n=row==='wildcard-5000'?5000:20000;
    const root=nodeFromJSONSchema({jsonSchema:listSchema,defaultValue:{list:Array.from({length:n},()=>({kind:'a'}))},validationMode:ValidationMode.None});
    return {run:()=>sink=root.findNodes('/list/*/kind'),count:row==='wildcard-5000'?40:10};
  }
  if(row==='virtual-derive'||row==='virtual-inject') {
    const props={src:{type:'string'},a:{type:'string'},b:{type:'string'}} as Record<string,unknown>;
    if(row==='virtual-inject') props.src={type:'string',controls:{injectTo:(v:unknown)=>typeof v==='string'?{'../group':[v,v+'_b']}:{}}};
    const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:props,options:{virtual:{group:row==='virtual-derive'?{fields:['a','b'],controls:{derived:'[ ../src , ../src + "_2" ]'}}:{fields:['a','b']}}}} as never,defaultValue:{src:'s'},validationMode:ValidationMode.None});
    const src=root.find('/src');
    return {run:i=>src.setValue('s'+i),count:10000};
  }
  if(row==='relay-scalar'||row==='relay-array'||row==='relay-virtual') {
    const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{name:{type:'string'},list:{type:'array',items:{type:'string'}},start:{type:'string'},end:{type:'string'}},options:{virtual:{period:{fields:['start','end']}}}} as never,defaultValue:{name:'n',list:['a','b'],start:'s',end:'e'},validationMode:ValidationMode.None});
    const node=root.find(row==='relay-scalar'?'/name':row==='relay-array'?'/list':'/period');
    const relay=(value:unknown,option:SetValueOption)=>node.setValue(value,option);
    return {run:i=>relayFieldNodeInput(node,row==='relay-scalar'?'v'+i:row==='relay-array'?['x'+i,'y']:['s'+i,'e'+i],SetValueOption.Overwrite,relay),count:10000};
  }
  if(row==='context-error-cause') {
    const a={error:new Error('same',{cause:{code:1,detail:['x']}}),aggregate:new AggregateError([new Error('a')],'same')};
    const b={error:new Error('same',{cause:{code:1,detail:['x']}}),aggregate:new AggregateError([new Error('a')],'same')};
    return {run:()=>sink=areContextsEqual(a,b),count:100000};
  }
  const root=nodeFromJSONSchema({jsonSchema:row==='virtual-reset'?virtualSchema:row.includes('array')||row==='batch-structural'||row==='batch-structural-observed'?listSchema:derived,defaultValue:row==='virtual-reset'?{note:'n'}:row.includes('array')||row==='batch-structural'||row==='batch-structural-observed'?{list:[{kind:'a'},{kind:'b'}]}:{a:1},validationMode:ValidationMode.None});
  const a=root.find('/a'); const list=root.find('/list');
  if(row==='batch-structural-observed'||row==='sequential-array-push-pop-observed') root.subscribe(()=>{});
  if(row==='batch-structural'||row==='batch-structural-observed') return {run:()=>root.batch(()=>{list.push({kind:'c'});list.pop()}),count:4000};
  if(row==='sequential-array-push-pop'||row==='sequential-array-push-pop-observed') return {run:()=>{list.push({kind:'c'});list.pop()},count:4000};
  if(row==='single-array-verb'||row==='array-rekey') return {run:()=>{list.insert(0,{kind:'c'});list.remove(0)},count:4000};
  if(row==='batch-write') return {run:i=>root.batch(()=>{a.setValue(i);a.setValue(i+1)}),count:15000};
  if(row==='batch-updater') return {run:i=>root.batch(()=>a.setValue(v=>(v??0)+1)),count:15000};
  if(row==='virtual-reset') {const before=JSON.stringify(root.value);root.find('/period').resetSubtree();if(JSON.stringify(root.value)!==before)throw Error('The ordinary virtual reset row must preserve its initially absent members');return {run:()=>root.find('/period').resetSubtree(),count:10000};}
  if(row==='reset-subtree') return {run:()=>a.resetSubtree(),count:15000};
  if(row==='watch-read') return {run:()=>sink=a.watchValues,count:200000};
  if(row==='find-single') return {run:()=>sink=root.find('/b'),count:200000};
  if(row==='derive-write'||row==='branch-nonnull') return {run:i=>a.setValue(i),count:20000};
  throw Error('Unknown row '+row);
}

export const rows=['mount-100','mount-plain','react-bridges','radio-options','provider-render','context-update','expr-scan','expr-division','pointer-resolve','compile-root-ref','compile-warnings','register-plugin','batch-write','batch-updater','batch-structural','batch-structural-observed','single-array-verb','array-rekey','reset-subtree','virtual-reset','watch-read','find-single','derive-write','branch-nonnull','wildcard-5000','wildcard-20000'];
