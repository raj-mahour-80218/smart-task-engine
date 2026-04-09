import api from '../services/api';

export default function TaskList({ tasks, reload }) {

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    reload();
  };

  return (
    <div className="task-grid">
      {tasks.map(task => (
        <div className="task-card" key={task.id}>
          <h4>{task.title}</h4>

          <div className="badges">
            <span className={`badge status ${task.status}`}>
              {task.status}
            </span>
            <span className={`badge priority ${task.priority}`}>
              {task.priority}
            </span>
          </div>

          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}