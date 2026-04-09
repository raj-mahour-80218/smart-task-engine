import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TaskList from "../components/TaskList";
import TaskModal from "../components/TaskModal";
import api from "../services/api";

export default function TaskPage() {
  const [tasks,     setTasks]     = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask,  setEditTask]  = useState(null); // null = create mode

  const load = async () => {
    const res = await api.get("/tasks/");
    setTasks(res.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = ()     => { setEditTask(null);  setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditTask(null); };

  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === "TODO").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done:       tasks.filter(t => t.status === "DONE").length,
  };

  return (
    <Layout taskCount={tasks.length}>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>Manage and track your work in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          &#43;&nbsp; Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card c-total">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card c-pending">
          <div className="stat-label">To Do</div>
          <div className="stat-value">{stats.todo}</div>
        </div>
        <div className="stat-card c-progress">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card c-done">
          <div className="stat-label">Done</div>
          <div className="stat-value">{stats.done}</div>
        </div>
      </div>

      {/* Task Cards */}
      <TaskList tasks={tasks} onEdit={openEdit} reload={load} />

      {/* Add / Edit Modal */}
      <TaskModal
        show={modalOpen}
        onClose={closeModal}
        onSaved={load}
        task={editTask}
      />

    </Layout>
  );
}