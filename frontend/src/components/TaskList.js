import { useState } from "react";
import api from "../services/api";

const STATUS_CYCLE = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO" };
const STATUS_ICON  = { TODO: "\u25a2", IN_PROGRESS: "\u25d4", DONE: "\u2714" };
const STATUS_NEXT  = { TODO: "Start", IN_PROGRESS: "Mark Done", DONE: "Reset" };

function DeadlinePill({ deadline }) {
  if (!deadline) return null;
  const dt   = new Date(deadline);
  const now  = new Date();
  const past = dt < now;
  return (
    <span className={`deadline-pill${past ? " deadline-past" : ""}`}>
      &#128197; {dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      {past && " \u00b7 Overdue"}
    </span>
  );
}

export default function TaskList({ tasks, onEdit, reload }) {
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);

  const deleteTask = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/tasks/${id}`);
      reload();
    } finally {
      setDeleting(null);
    }
  };

  const cycleStatus = async (task) => {
    const nextStatus = STATUS_CYCLE[task.status] ?? "TODO";
    setUpdating(task.id);
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      reload();
    } finally {
      setUpdating(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="task-grid">
        <div className="empty-state">
          <div className="empty-state-icon">&#128203;</div>
          <h3>No tasks yet</h3>
          <p>Click "Add Task" above to create your first task.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="task-section-header">
        <span className="task-section-title">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card priority-${task.priority} status-${task.status}`}
          >
            <div className="task-card-top">
              <span className="task-title">{task.title}</span>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-badges">
              <span className={`badge status ${task.status}`}>
                {task.status === "IN_PROGRESS" ? "In\u00a0Progress" : task.status === "TODO" ? "To\u00a0Do" : task.status}
              </span>
              <span className={`badge priority ${task.priority}`}>
                {task.priority}
              </span>
            </div>

            {task.deadline && (
              <DeadlinePill deadline={task.deadline} />
            )}

            <div className="task-card-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => cycleStatus(task)}
                disabled={updating === task.id}
                title={STATUS_NEXT[task.status]}
              >
                {updating === task.id
                  ? "\u22ef"
                  : `${STATUS_ICON[task.status]}\u00a0${STATUS_NEXT[task.status]}`}
              </button>

              <div className="task-actions">
                <button
                  className="btn btn-edit btn-sm btn-icon"
                  onClick={() => onEdit(task)}
                  title="Edit task"
                >
                  &#9998;
                </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => deleteTask(task.id)}
                  disabled={deleting === task.id}
                  title="Delete task"
                >
                  {deleting === task.id ? "\u22ef" : "\u2715"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}