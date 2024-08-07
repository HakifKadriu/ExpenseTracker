import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { useHistory, Link } from "react-router-dom";
import Globalfunctions from "../../globalfunctions";

const Sidebar = () => {
  const { handleLogout, getCurrentUser } = Globalfunctions();
  const [currentUser, setcurrentUser] = useState([]);


  useEffect(() => {
    getCurrentUser()
      .then((result) => {
        setcurrentUser(result);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">ExpenseTracker</div>
      <div className="sidebar-user">
        <i className="bi bi-person-circle"></i>
        <span>{currentUser?.username}</span>
      </div>
      <div className="sidebar-links">
        <hr></hr>
        <Link className="sidebar-link" to="/ExpenseTracker/myexpenses/private">
          Private Expenses
        </Link>
        <Link className="sidebar-link" to="/ExpenseTracker/myexpenses/shared">
          Shared Expenses
        </Link>
        <hr></hr>
        <Link className="sidebar-link" to="/ExpenseTracker/myincomes/private">
          Private Incomes
        </Link>
        <Link className="sidebar-link" to="/ExpenseTracker/myincomes/shared">
          Shared Incomes
        </Link>
        <hr></hr>
      </div>
      <div className="sidebar-logout" onClick={handleLogout}>
        Log Out
      </div>
    </div>
  );
};

export default Sidebar;
