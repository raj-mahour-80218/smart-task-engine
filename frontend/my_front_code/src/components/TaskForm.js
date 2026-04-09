import { useState } from 'react';
import api from '../services/api';

export default function TaskForm({ reload }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [error, setError] = useState(null);

  const submit = async () => {
    try {
      await api.post('/tasks/', { title, priority });
      setTitle('');
      setError(null);
      reload();
    } catch (e) {
      setError(e.response?.data?.errors?.join(', ') || 'Error');
    }
  };

  return (
    <div className="form-card">
      <h3>Create Task</h3>

      <label>Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} />

      <label>Priority</label>
      <select value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      <button onClick={submit}>Add Task</button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}