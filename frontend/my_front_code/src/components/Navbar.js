export default function Navbar({ toggle }) {
  return (
    <div className="navbar">
      <button className="menu-btn" onClick={toggle}>☰</button>
      <h3>Smart Task Manager</h3>
    </div>
  );
}