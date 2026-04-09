import { useState } from 'react';
import TaskPage from './pages/TaskPage';
import './index.css';
import './styles/layout.css';
import './styles/components.css';

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <h3>{collapsed ? 'TM' : 'Task Manager'}</h3>

        <p>📋 {!collapsed && 'Tasks'}</p>
        <p>📊 {!collapsed && 'Dashboard'}</p>
      </div>

      {/* Main */}
      <div className="main">
        <div className="navbar">
          <button onClick={() => setCollapsed(!collapsed)}>
            ☰
          </button>

          <h2>Smart Task Manager</h2>
        </div>

        <div className="content">
          <TaskPage />
        </div>
      </div>
    </div>
  );
}

export default App;