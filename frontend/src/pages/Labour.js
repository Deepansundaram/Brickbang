import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const Labour = () => {
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('workers');
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workersData, tasksData] = await Promise.all([
        api.labour.getWorkers(),
        api.labour.getTasks()
      ]);
      setWorkers(workersData);
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading labour data...</div>;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="d-flex gap-2">
            <button 
              className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('workers')}
            >
              Workers ({workers.length})
            </button>
            <button 
              className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks ({tasks.length})
            </button>
          </div>
          <button className="btn btn-success">
            {activeTab === 'workers' ? 'Add Worker' : 'Create Task'}
          </button>
        </div>
        <div className="card-body">
          {activeTab === 'workers' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Skill</th>
                  <th>Hourly Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id}>
                    <td>{worker.name}</td>
                    <td>{worker.skill_category}</td>
                    <td>${worker.hourly_rate}/hr</td>
                    <td><span className="badge bg-success">Active</span></td>
                    <td>
                      <button className="btn btn-sm btn-primary">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.worker?.name || 'Unassigned'}</td>
                    <td><span className="badge bg-warning">{task.status}</span></td>
                    <td>{Math.round((task.actual_hours / task.estimated_hours) * 100)}%</td>
                    <td><span className="badge bg-info">{task.priority}</span></td>
                    <td>
                      <button className="btn btn-sm btn-primary">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Labour;
