import React, { useEffect, useState } from "react";
import "./SharedExpenses.css";
import Sidebar from "../Sidebar/Sidebar";
import Table from "react-bootstrap/Table";
import api from "../../api";
import Globalfunctions from "../../globalfunctions";
import Swal from "sweetalert2";

const SharedExpenses = () => {
  const {
    getUserPrivateExpenses,
    deleteExpense,
    createExpense,
    editExpense,
    // getSingleExpense,
  } = Globalfunctions();

  const [expenses, setExpenses] = useState([]);

  return (
    <div className="sheBody">
      <Sidebar></Sidebar>
      <div className="sheRightSide">
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
              <tr key={expense.id}>
                <td>{expense.description}</td>
                <td>{expense.amount}</td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10%",
                  }}
                >
                  <i
                    className="bi bi-trash dashboardActionIcons"
                    onClick={() => {
                      deleteExpense(expense._id);
                    }}
                  ></i>
                  <i
                    className="bi bi-pencil-square dashboardActionIcons"

                  ></i>
                </td>
              </tr>
            ))}
            {expenses == "" ? <div>No expenses exist</div> : ""}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SharedExpenses;
