const About = () => {
  return (
    <div className="page">
      <h1>About This Test Environment</h1>
      
      <section>
        <h2>Purpose</h2>
        <p>
          This is a production test environment for the Aileron project. 
          It provides a clean, minimal setup for testing various React components, 
          features, and integrations in isolation.
        </p>
      </section>

      <section>
        <h2>Tech Stack</h2>
        <ul>
          <li><strong>Vite</strong> - Fast build tool and dev server</li>
          <li><strong>React 19</strong> - UI library</li>
          <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
          <li><strong>React Router v6</strong> - Client-side routing</li>
        </ul>
      </section>

      <section>
        <h2>Available Test Pages</h2>
        <ul>
          <li><strong>Home</strong> - Landing page with overview</li>
          <li><strong>Component Test</strong> - Basic React component interactions</li>
          <li><strong>Form Test</strong> - Form handling and validation</li>
          <li><strong>API Test</strong> - Data fetching and async operations</li>
          <li><strong>About</strong> - This page</li>
        </ul>
      </section>

      <section>
        <h2>Development</h2>
        <p>To add new test pages:</p>
        <ol>
          <li>Create a new component in <code>src/pages/</code></li>
          <li>Add the route in <code>App.tsx</code></li>
          <li>Add navigation link in the navigation component</li>
        </ol>
      </section>
    </div>
  );
};

export default About;