import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../styles/layout.css";

export default function Layout({ children, taskCount }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />

      <div className={`main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar
          toggle={() => setCollapsed(!collapsed)}
          taskCount={taskCount}
        />

        <main className="content">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}