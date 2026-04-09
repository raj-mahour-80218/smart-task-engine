import { useEffect, useState } from 'react';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Layout from '../components/Layout';

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const res = await api.get('/tasks/');
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <Layout>
      <TaskForm reload={loadTasks} />
      <TaskList tasks={tasks} reload={loadTasks} />
    </Layout>
  );
}