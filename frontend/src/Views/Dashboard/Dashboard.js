import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import api from "../../api";
import Sidebar from "../Sidebar/Sidebar";
import Table from "react-bootstrap/Table";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);

  const getUserPrivateExpenses = async (event) => {
    try {
      const response = await api.get(
        "/expense/user/" + localStorage.getItem("userID")
      );

      setExpenses(response.data.privateExpenses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserPrivateExpenses();
  }, []);

  return (
    <div className="dashboardBody">
      <Sidebar></Sidebar>
      <div className="dashboardRightSide">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
              >
                <td>{expense.description}</td>
                <td>{expense.amount}</td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
