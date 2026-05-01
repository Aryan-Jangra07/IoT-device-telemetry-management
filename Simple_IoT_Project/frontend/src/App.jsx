import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Smart IoT Monitoring</h1>
        <p>Real-time telemetry and alerts from your IoT devices.</p>
      </header>
      
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
