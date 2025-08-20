import { useState } from 'react';

const ComponentTest = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="page">
      <h1>Component Test Page</h1>
      <p>Use this page to test various React components and interactions.</p>
      
      <section>
        <h2>Counter Example</h2>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </section>

      <section>
        <h2>Input Example</h2>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
          style={{ padding: '0.5rem', marginRight: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <p>You typed: {inputValue}</p>
      </section>

      <section>
        <h2>List Example</h2>
        <ul>
          {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ComponentTest;