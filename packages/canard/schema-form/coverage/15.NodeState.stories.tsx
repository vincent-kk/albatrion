import { useRef, useState } from 'react';

import { useRenderCount } from '@aileron/development-helper';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
  NodeState,
  ShowError,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/15. NodeState',
};

export const CheckNodeState = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        format: 'uri',
      },
      age: {
        type: 'number',
      },
      nationality: {
        type: 'string',
      },
    },
  } satisfies JsonSchema;

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    errorMessage,
  }: FormTypeRendererProps) => {
    const {
      [NodeState.Dirty]: dirty,
      [NodeState.Touched]: touched,
      [NodeState.ShowError]: showError,
    } = node.state || {};
    const renderCount = useRenderCount();
    return depth === 0 ? (
      <Input />
    ) : (
      <div style={{ borderBottom: '1px dashed #000', marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 10 }}>
          <span>{name}</span>
          <Input />
          <span>{renderCount}</span>
          <button
            onClick={() => node.setState({ [NodeState.ShowError]: true })}
          >
            showError
          </button>
          <button onClick={() => node.setState()}>state clear</button>
          <button
            onClick={() => node.setState({ [NodeState.Dirty]: undefined })}
          >
            dirty clear
          </button>
          <button
            onClick={() => node.setState({ [NodeState.Touched]: undefined })}
          >
            touched clear
          </button>
          <button
            onClick={() => node.setState({ [NodeState.ShowError]: undefined })}
          >
            showError clear
          </button>
        </label>
        <pre>{JSON.stringify({ dirty, touched, showError })}</pre>
        <pre>{JSON.stringify(node.errors)}</pre>
        {errorMessage}
      </div>
    );
  };

  const [showError, setShowError] = useState<ShowError | boolean>(
    ShowError.DirtyTouched,
  );

  const refHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(
                typeof showError === 'number' &&
                showError & ShowError.DirtyTouched
              )
            }
            value={ShowError.DirtyTouched}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.DirtyTouched;
                return e.target.checked
                  ? prev | ShowError.DirtyTouched
                  : prev & ~ShowError.DirtyTouched;
              });
            }}
          />
          DirtyTouched
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Dirty)
            }
            value={ShowError.Dirty}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Dirty;
                return e.target.checked
                  ? prev | ShowError.Dirty
                  : prev & ~ShowError.Dirty;
              });
            }}
          />
          Dirty
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Touched)
            }
            value={ShowError.Touched}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Touched;
                return e.target.checked
                  ? prev | ShowError.Touched
                  : prev & ~ShowError.Touched;
              });
            }}
          />
          Touched
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Always)
            }
            value={ShowError.Always}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Always;
                return e.target.checked
                  ? prev | ShowError.Always
                  : prev & ~ShowError.Always;
              });
            }}
          />
          Always
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Never)
            }
            value={ShowError.Never}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Never;
                return e.target.checked
                  ? prev | ShowError.Never
                  : prev & ~ShowError.Never;
              });
            }}
          />
          Never
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === true}
            value={'true'}
            onChange={() => setShowError(true)}
          />
          true
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === false}
            value={'false'}
            onChange={() => setShowError(false)}
          />
          false
        </label>
      </div>
      <hr />
      <div>
        <button onClick={() => refHandle.current?.focus('/name')}>
          focus "/name"
        </button>
        <button onClick={() => refHandle.current?.select('/name')}>
          select ".name"
        </button>
      </div>
      <hr />
      <StoryLayout jsonSchema={jsonSchema}>
        <Form
          key={`${showError}`}
          ref={refHandle}
          jsonSchema={jsonSchema}
          showError={showError}
          CustomFormTypeRenderer={Renderer}
        />
      </StoryLayout>
    </div>
  );
};
