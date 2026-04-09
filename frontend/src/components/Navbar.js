export default function Navbar({ toggle, taskCount }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggle} title="Toggle sidebar">
          &#9776;
        </button>
        <span className="navbar-title">Smart Task Manager</span>
      </div>

      <div className="navbar-right">
        <span className="navbar-pill">
          &#128197; {taskCount ?? 0} task{taskCount !== 1 ? 's' : ''}
        </span>
      </div>
    </header>
  );
}