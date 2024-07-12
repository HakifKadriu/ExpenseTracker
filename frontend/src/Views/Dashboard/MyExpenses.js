import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import api from "../../api";
import Sidebar from "../Sidebar/Sidebar";
import Table from "react-bootstrap/Table";
import Globalfunctions from "../../globalfunctions";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

// todo
// create shared expeses page
// token validation
// test income updating
// income page
// filtering and pagination
// css rework


const Dashboard = () => {
  const { mode } = useParams();
  const {
    getUserExpenses,
    deleteExpense,
    createExpense,
    editExpense,
    getCurrentUser,
    // getSingleExpense,
  } = Globalfunctions();

  const [privateExpenses, setPrivateExpenses] = useState([]);
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [show, setShow] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [tempUser, settempUser] = useState("");
  const [currentUserUsername, setcurrentUserUsername] = useState("");
  const [tempExpenseId, settempExpenseId] = useState("");

  const [userId, setcurrentUserId] = useState(localStorage.getItem("userID"));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);

  useEffect(() => {
    getUserExpenses()
      .then((result) => {
        setPrivateExpenses(result.privateExpenses);
        setSharedExpenses(result.sharedExpenses);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expenseData = {
      userId,
      expenseId: tempExpenseId,
      description,
      amount,
      date,
      category,
      isShared: isShared,
      sharedWith: isShared ? sharedWith : [],
    };

    if (isEditing) {
      try {
        await editExpense(expenseData);
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: err.response.data.message,
          icon: "error",
        });
      }
    } else {
      await createExpense(expenseData);
    }

    setShow(false);
    clearExpenseInfo();
    setTimer();
  };

  const clearExpenseInfo = () => {
    setDescription("");
    setAmount(0);
    setDate("");
    setCategory("");
    setIsShared(false);
    setSharedWith([]);
    setisEditing(false);
    settempExpenseId("");
  };

  const setTimer = () => {
    setTimeout(() => {
      getUserExpenses()
        .then((result) => {
          setPrivateExpenses(result.privateExpenses);
          setSharedExpenses(result.sharedExpenses);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }, 750);
  };

  const getSingleExpense = async (expenseId) => {
    try {
      const response = await api.get("/expense/" + expenseId);

      if (response.data) {
        setDescription(response.data.description);
        setAmount(response.data.amount);
        setDate(response.data.date.split("T")[0]);
        setCategory(response.data.category);
        setIsShared(response.data.isShared);
        setSharedWith(response.data.sharedWith);
        settempExpenseId(response.data._id);
        setShow(true);
        setisEditing(true);
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

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
              {mode == "shared" && <th>Participants</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mode == "private"
              ? privateExpenses?.map((expense) => (
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
                          setTimer();
                        }}
                      ></i>
                      <i
                        className="bi bi-pencil-square dashboardActionIcons"
                        onClick={async () => {
                          await getSingleExpense(expense._id);
                        }}
                      ></i>
                    </td>
                  </tr>
                ))
              : sharedExpenses?.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{expense.amount}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.sharedWith
                        .map((user) => user.username)
                        .join(", ")}
                    </td>
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
                          setTimer();
                        }}
                      ></i>
                      <i
                        className="bi bi-pencil-square dashboardActionIcons"
                        onClick={async () => {
                          await getSingleExpense(expense._id);
                        }}
                      ></i>
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
      </div>

      <div
        className="dashboardAddExpenseButton"
        onClick={() => {
          setShow(true);
        }}
      >
        Add Expense <i className="bi bi-plus-circle"></i>
      </div>

      {show ? (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              {isEditing ? <h2>Edit Expense</h2> : <h2>Create Expense</h2>}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={() => setIsShared(!isShared)}
                  />
                  Share with others
                </label>
              </div>
              {isShared && (
                <>
                  <div className="form-group" style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={tempUser}
                      onChange={(e) => settempUser(e.target.value)}
                      // style={{width: "90%"}}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSharedWith([...sharedWith, tempUser]);
                        settempUser("");
                      }}
                      style={{
                        width: "fit-content",
                        border: "1px solid black",
                      }}
                    >
                      Add User
                    </button>
                  </div>
                  Shared with:
                  <div
                    style={{
                      border: "1px solid black",
                      overflowY: "scroll",
                      height: "10rem",
                    }}
                  >
                    {sharedWith?.map((user) => (
                      <p
                        style={{
                          borderBottom: "1px solid black",
                          width: "fit-content",
                          height: "fit-content",
                          margin: "5px",
                        }}
                      >
                        {user}
                      </p>
                    ))}
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setShow(false);
                    setisEditing(false);
                    clearExpenseInfo();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Dashboard;
