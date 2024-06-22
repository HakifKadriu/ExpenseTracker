import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import api from "../../api";
import { useHistory } from "react-router-dom";

const Sidebar = () => {
  const history = useHistory();

  const [currentUser, setcurrentUser] = useState([]);

  const getUserInfo = async (event) => {
    try {
      const response = await api.get("/user/" + localStorage.getItem("userID"));

      setcurrentUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    history.push("/login");
  };

  useEffect(() => {
    getUserInfo();
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
        <p className="sidebarExpenses">
          {" "}
          <i className="bi bi-person-fill"></i> My Expenses
        </p>
        <p className="sidebarExpenses">
          {" "}
          <i className="bi bi-people-fill"></i> Shared
        </p>
      </div>
      <div className="sidebarLogout" >
        <p className="sidebarExpenses" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log Out
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
