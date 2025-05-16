import React, { useEffect, useState } from "react";
import "./css/StaffDashboard.css";

const RiderDashboard = () => {
  const [riderName, setRiderName] = useState("John Rider");
  const [tasks, setTasks] = useState([
    { id: 1, title: "Deliver to 123 Main St", status: "Pending" },
    { id: 2, title: "Pick up from Store B", status: "Ongoing" },
  ]);

  useEffect(() => {
    // Simulate loading user or tasks
  }, []);

  return (
    <div className="rider-dashboard">
      <header className="rider-header">
        <h2>Welcome, {riderName}</h2>
      </header>

      <section className="stats-section">
        <div className="stat-box">
          <p className="stat-number">4</p>
          <p className="stat-label">Deliveries Today</p>
        </div>
        <div className="stat-box">
          <p className="stat-number">2</p>
          <p className="stat-label">Ongoing</p>
        </div>
      </section>

      <section className="task-list">
        <h3>Active Tasks</h3>
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <p>{task.title}</p>
            <span className={`status ${task.status.toLowerCase()}`}>
              {task.status}
            </span>
          </div>
        ))}
      </section>

      <section className="action-buttons">
        <button className="start-btn">Start New Delivery</button>
        <button className="view-btn">View All Tasks</button>
      </section>
      
    </div>
  );
};

export default RiderDashboard;
