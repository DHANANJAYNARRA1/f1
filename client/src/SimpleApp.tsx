import { useState } from 'react';

export default function SimpleApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Simple Test App</h1>
      <div>
        <p>Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
      </div>
    </div>
  );
}