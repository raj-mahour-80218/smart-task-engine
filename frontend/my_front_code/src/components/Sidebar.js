export default function Sidebar({ collapsed }) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="item">
        <span>📋</span>
        {!collapsed && <span>Tasks</span>}
      </div>
    </div>
  );
}