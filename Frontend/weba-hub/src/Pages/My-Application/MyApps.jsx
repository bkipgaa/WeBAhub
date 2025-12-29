import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./MyApps.css"; // Import your CSS file
import expense from "../../../src/Assets/expense.png"
import hr from "../../../src/Assets/hr.png"
import tool_manager from "../../../src/Assets/tool_manager.jpeg"
import ticket from "../../../src/Assets/ticket.png"


const MyApplication = ({ userType }) => {
  return (
    <div className="app-container">
      <h2 className="app-title">My Services</h2>
      <div className="app-grid">
        <Link to="hr-hub" className="app-card">
          <img src={hr} alt="HR Hub" className="app-icon" />
          <p className="app-text">HR Hub</p>
        </Link>
        <Link to="expense-hub" className="app-card">
          <img src={expense} alt="Expense Hub" className="app-icon" />
          <p className="app-text">Expense Hub</p>
        </Link>
        <Link to="tool-manager" className="app-card">
          <img src={tool_manager}alt="Tool Manager" className="app-icon" />
          <p className="app-text">Tool Manager</p>
        </Link>
        <Link to="tickets" className="app-card">
          <img src={ticket} alt="Tickets" className="app-icon" />
          <p className="app-text">Tickets</p>
        </Link>
        {/* Profile Links without icons */}
        {userType === 'technician' && (
          <Link to="profile" className="app-card profile-card">
            <p className="app-text">My Profile</p>
          </Link>
        )}
        
        {userType === 'client' && (
          <Link to="/clientprofile" className="app-card profile-card">
            <p className="app-text">My Profile</p>
          </Link>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default MyApplication;

