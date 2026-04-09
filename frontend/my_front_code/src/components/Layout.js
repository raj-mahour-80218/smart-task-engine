import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/layout.css';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} />
      <div className={`main ${collapsed ? 'collapsed' : ''}`}>
        <Navbar toggle={() => setCollapsed(!collapsed)} />
        <div className="content">{children}</div>
        <Footer />
      </div>
    </div>
  );
}