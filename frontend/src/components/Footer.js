export default function Footer() {
  return (
    <footer className="footer">
      <span>&#169; {new Date().getFullYear()} Smart Task Manager</span>
      <span className="footer-dot">&#183;</span>
      <span>Built with React</span>
    </footer>
  );
}