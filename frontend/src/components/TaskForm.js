import { useState } from "react";
import api from "../services/api";

export default function TaskForm({ reload }) {
  const [title, setTitle]       = useState("");
  const [priority, setPriority] = useState("LOW");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const submit = async () => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.post("/tasks/", { title: title.trim(), priority });
      setTitle("");
      reload();
    } catch (err) {
      setError(err.response?.data?.errors?.join(", ") || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div className="form-icon">&#10133;</div>
        <h3>Add New Task</h3>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Task Title</label>
          <input
            className="form-control"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            className="form-control"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">&nbsp;</label>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '&#43;'}
            {loading ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error">
          &#9888; {error}
        </div>
      )}
    </div>
  );
}