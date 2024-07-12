import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import api from "../../api";
import { useHistory } from "react-router-dom";
import Globalfunctions from "../../globalfunctions";

const Sidebar = () => {
  const { handleLogout, getCurrentUser } = Globalfunctions();
  const [currentUser, setcurrentUser] = useState([]);

  const history = useHistory();

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
    <div className="sidebarBody">
      <div>
        {" "}
        <h2 className="sidebarUsername">{currentUser.username}</h2>
      </div>

      <div
        style={{
          border: "1px solid white",
          marginBottom: "1rem",
        }}
      ></div>
      <div>
        <p
          className="sidebarExpenses"
          onClick={() => history.push("/myexpenses/private")}
        >
          {" "}
          <i className="bi bi-person-fill"></i> My Expenses
        </p>
        <p
          className="sidebarExpenses"
          onClick={() => history.push("/myexpenses/shared")}
        >
          {" "}
          <i className="bi bi-people-fill"></i> Shared
        </p>
      </div>
      <div className="sidebarLogout">
        <p className="sidebarExpenses" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log Out
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
