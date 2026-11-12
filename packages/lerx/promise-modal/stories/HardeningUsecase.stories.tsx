// Loaded by Storybook; each named export is an interactive contract demonstration.
import { createContext, useContext, useState } from 'react';

import { ModalProvider, alert, confirm, prompt } from '../src';
import { HardeningFrame } from './components/HardeningFrame';

export default { title: 'PromiseModal/Hardening' };

/** Moves and detaches a single anchor while retaining the prompt input. */
export const DeclarativeRoot = () => {
  const [first, setFirst] = useState<HTMLDivElement | null>(null);
  const [second, setSecond] = useState<HTMLDivElement | null>(null);
  const [target, setTarget] = useState<'first' | 'second' | 'paused'>('first');
  const [result, setResult] = useState('No result');
  const root = target === 'first' ? first : target === 'second' ? second : null;
  const controls = (
    <nav aria-label="Portal root">
      <button onClick={() => setTarget('first')}>Use first root</button>
      <button onClick={() => setTarget('second')}>Use second root</button>
      <button onClick={() => setTarget('paused')}>Detach root</button>
    </nav>
  );
  return (
    <ModalProvider root={root} ForegroundComponent={HardeningFrame}>
      <p>
        Type in the prompt, move its root, or detach and resume it. Input and
        result survive.
      </p>
      <div ref={setFirst} data-root="first">
        First root
      </div>
      <div ref={setSecond} data-root="second">
        Second root
      </div>
      {controls}
      <button
        onClick={() =>
          void prompt<string>({
            title: 'Move this prompt',
            defaultValue: '',
            content: () => controls,
            Input: ({ value, onChange }) => (
              <input
                aria-label="Retained input"
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
              />
            ),
          }).then((value) => setResult(`Prompt: ${String(value)}`))
        }
      >
        Open prompt
      </button>
      <button onClick={() => void alert({ title: 'Queued while detached' })}>
        Queue alert
      </button>
      <output>
        {result}; selected root: {target}
      </output>
    </ModalProvider>
  );
};

/** Lets keyboard users compare Escape, Tab, scroll locking and nondimmed behavior. */
export const KeyboardAndScroll = () => {
  const [closeOnEscape, setEscape] = useState(true);
  const [trapFocus, setTrap] = useState(true);
  const [lockScroll, setLock] = useState(true);
  const [dimmed, setDimmed] = useState(true);
  const [result, setResult] = useState('Ready');
  return (
    <ModalProvider
      ForegroundComponent={HardeningFrame}
      options={{ closeOnEscape, trapFocus, lockScroll }}
    >
      <div style={{ minHeight: '170vh' }}>
        <p>
          Open, press Tab and Shift+Tab, scroll, then press Escape. Focus
          returns to the opener.
        </p>
        <label>
          <input
            type="checkbox"
            checked={closeOnEscape}
            onChange={(event) => setEscape(event.target.checked)}
          />
          closeOnEscape
        </label>
        <label>
          <input
            type="checkbox"
            checked={trapFocus}
            onChange={(event) => setTrap(event.target.checked)}
          />
          trapFocus
        </label>
        <label>
          <input
            type="checkbox"
            checked={lockScroll}
            onChange={(event) => setLock(event.target.checked)}
          />
          lockScroll
        </label>
        <label>
          <input
            type="checkbox"
            checked={dimmed}
            onChange={(event) => setDimmed(event.target.checked)}
          />
          dimmed
        </label>
        <button
          onClick={() =>
            void confirm({
              title: 'Keyboard and page effects',
              closeOnEscape,
              dimmed,
              closeOnBackdropClick: false,
              content: (
                <>
                  <input aria-label="First control" />
                  <button>Last content control</button>
                </>
              ),
            }).then((value) => setResult(`Confirmed: ${value}`))
          }
        >
          Open accessible confirm
        </button>
        <output>{result}</output>
        <p style={{ marginTop: '100vh' }}>Scroll target behind the modal</p>
      </div>
    </ModalProvider>
  );
};

/** Stacks a nondimmed request above a dimmed one so Tab stays in the browser's own order. */
export const NondimmedAboveDimmed = () => {
  const [result, setResult] = useState('Ready');
  const openNondimmed = () =>
    void alert({
      title: 'Nondimmed request above',
      dimmed: false,
      closeOnBackdropClick: false,
      content: (
        <>
          <button>Upper first control</button>
          <button>Upper last control</button>
        </>
      ),
    });
  return (
    <ModalProvider ForegroundComponent={HardeningFrame}>
      <p>
        Open the dimmed confirm, then the nondimmed request from inside it. Tab
        in the upper request follows the browser order; the page stays
        unreachable.
      </p>
      <button
        onClick={() =>
          void confirm({
            title: 'Dimmed request below',
            content: (
              <>
                <input aria-label="Lower first control" />
                <button onClick={openNondimmed}>Open nondimmed above</button>
              </>
            ),
          }).then((value) => setResult(`Confirmed: ${value}`))
        }
      >
        Open dimmed confirm
      </button>
      <output>{result}</output>
    </ModalProvider>
  );
};

/** Catches rejection at the request while leaving a peer and later requests usable. */
export const RenderErrorRejection = () => {
  const [result, setResult] = useState('Ready');
  const openBroken = async () => {
    void alert({
      title: 'Surviving peer',
      dimmed: false,
      closeOnBackdropClick: false,
    });
    try {
      await prompt({
        title: 'Broken input',
        Input: () => {
          throw new Error('Demonstration render failure');
        },
      });
    } catch (error) {
      setResult(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <ModalProvider ForegroundComponent={HardeningFrame}>
      <p>
        The input throws deliberately; the rejected Promise is handled here.
      </p>
      <button onClick={() => void openBroken()}>
        Open peer and broken input
      </button>
      <button onClick={() => void alert({ title: 'Later request' })}>
        Open after rejection
      </button>
      <output>{result}</output>
    </ModalProvider>
  );
};

/** Compares equal numeric, millisecond and second timing through visible exit animations. */
export const DurationForms = () => (
  <ModalProvider
    ForegroundComponent={HardeningFrame}
    options={{ duration: 300, manualDestroy: true }}
  >
    <p>Each form yields 300ms. Close each dialog to see its exit animation.</p>
    <button onClick={() => void alert({ title: 'Numeric', duration: 300 })}>
      300
    </button>
    <button
      onClick={() => void alert({ title: 'Milliseconds', duration: '300ms' })}
    >
      300ms
    </button>
    <button onClick={() => void alert({ title: 'Seconds', duration: '0.3s' })}>
      0.3s
    </button>
  </ModalProvider>
);

/** The story router supplies the same pathname to the page and modal portal. */
const Route = createContext('/editor');
/** Adapts the story router to the public pathname hook contract. */
const useStoryPathname = () => ({ pathname: useContext(Route) });

/** Hides an unsettled prompt by route and restores its current value on return. */
export const RouteVisibility = () => {
  const [pathname, setPathname] = useState('/editor');
  const [result, setResult] = useState('Pending until confirm or cancel');
  return (
    <Route.Provider value={pathname}>
      <ModalProvider
        usePathname={useStoryPathname}
        ForegroundComponent={HardeningFrame}
        options={{ manualDestroy: true }}
      >
        <p>
          Open on /editor, type, navigate from inside the modal, then return
          from the page.
        </p>
        <p>Current route: {pathname}</p>
        <button onClick={() => setPathname('/editor')}>
          Return to /editor
        </button>
        <button
          onClick={() =>
            void prompt<string>({
              title: 'Route-scoped prompt',
              defaultValue: '',
              content: () => (
                <button onClick={() => setPathname('/other')}>
                  Navigate to /other
                </button>
              ),
              Input: ({ value, onChange }) => (
                <input
                  aria-label="Route input"
                  value={value ?? ''}
                  onChange={(event) => onChange(event.target.value)}
                />
              ),
            }).then((value) => setResult(`Settled: ${String(value)}`))
          }
        >
          Open prompt here
        </button>
        <output>{result}</output>
      </ModalProvider>
    </Route.Provider>
  );
};
