export default function Sidebar({ collapsed, toggle }) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">&#9889;</div>
        <span className="sidebar-brand">TaskEngine</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-item active">
          <span className="nav-icon">&#128203;</span>
          <span className="nav-label">Tasks</span>
        </div>
        <div className="sidebar-nav-item">
          <span className="nav-icon">&#128202;</span>
          <span className="nav-label">Analytics</span>
        </div>
        <div className="sidebar-nav-item">
          <span className="nav-icon">&#9881;</span>
          <span className="nav-label">Settings</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="collapse-btn" onClick={toggle}>
          <span>{collapsed ? '\u2192' : '\u2190'}</span>
          <span className="collapse-btn-label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>
    </aside>
  );
}