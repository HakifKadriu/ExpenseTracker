import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import api from "../../api";
import Sidebar from "../Sidebar/Sidebar";
import Table from "react-bootstrap/Table";
import Globalfunctions from "../../globalfunctions";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

const Dashboard = () => {
  const { mode } = useParams();
  const {
    getUserExpenses,
    deleteExpense,
    createExpense,
    editExpense,
  } = Globalfunctions();

  const [privateExpenses, setPrivateExpenses] = useState([]);
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [show, setShow] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [tempUser, settempUser] = useState("");
  // const [currentUserUsername, setcurrentUserUsername] = useState("");
  const [tempExpenseId, settempExpenseId] = useState("");

  const [userId, setcurrentUserId] = useState(localStorage.getItem("userID"));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);

  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState(1); // 1 for ascending, -1 for descending

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(-sortOrder); // asc -> -sortorder = desc
    } else {
      setSortKey(key);
      setSortOrder(1); // Default to ascending
    }
  };

  const sortedPrivateExpenses = [...privateExpenses].sort((a, b) => {
    switch (sortKey) {
      case "description":
        return sortOrder * a.description.localeCompare(b.description);
      case "amount":
        return sortOrder * (a.amount - b.amount);
      case "date":
        return sortOrder * (new Date(a.date) - new Date(b.date));
      case "category":
        return sortOrder * a.category.localeCompare(b.category);
      case "lastUpdatedOn":
        return sortOrder * (new Date(a.updatedAt) - new Date(b.updatedAt));
      default:
        return 0;
    }
  });

  const sortedSharedExpenses = [...sharedExpenses].sort((a, b) => {
    switch (sortKey) {
      case "description":
        return sortOrder * a.description.localeCompare(b.description);
      case "amount":
        return sortOrder * (a.amount - b.amount);
      case "date":
        return sortOrder * (new Date(a.date) - new Date(b.date));
      case "category":
        return sortOrder * a.category.localeCompare(b.category);
      case "lastUpdatedOn":
        return sortOrder * (new Date(a.updatedAt) - new Date(b.updatedAt));
      default:
        return 0;
    }
  });

  useEffect(() => {
    getUserExpenses()
      .then((result) => {
        setPrivateExpenses(result.privateExpenses);
        setSharedExpenses(result.sharedExpenses);
      })
      .catch((error) => {
        console.log(error.message);
      });

    if (sharedWith.length === 0) {
      setIsShared(false);
    } else {
      setIsShared(true);
    }
  }, [sharedWith]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // mi hjek duplicates
    // const uniqueSharedWith = [...new Set(sharedWith)];

    const expenseData = {
      userId,
      expenseId: tempExpenseId,
      description,
      amount,
      date,
      category,
      isShared: sharedWith.length > 0,
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
        setSharedWith(response.data.sharedWith.map((user) => user.username));
        settempExpenseId(response.data._id);
        setShow(true);
        setisEditing(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeUser = (username) => {
    setSharedWith(sharedWith.filter((user) => user !== username));
  };

  return (
    <div className="dashboardBody">
      <Sidebar></Sidebar>
      <div className="dashboardRightSide">
        <h2 style={{ alignSelf: "center" }}>
          {mode === "private" ? "Private Expenses" : "Shared Expenses"}
        </h2>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort("description")}>
                Description{" "}
                {sortKey === "description" ? (sortOrder === 1 ? "⬆" : "⬇") : ""}
              </th>
              <th onClick={() => handleSort("amount")}>
                Amount{" "}
                {sortKey === "amount" ? (sortOrder === 1 ? "⬆" : "⬇") : ""}
              </th>
              <th onClick={() => handleSort("date")}>
                Date {sortKey === "date" ? (sortOrder === 1 ? "⬆" : "⬇") : ""}
              </th>
              <th onClick={() => handleSort("category")}>
                Category{" "}
                {sortKey === "category" ? (sortOrder === 1 ? "⬆" : "⬇") : ""}
              </th>
              <th onClick={() => handleSort("lastUpdatedOn")}>
                Last Updated On{" "}
                {sortKey === "lastUpdatedOn"
                  ? sortOrder === 1
                    ? "⬆"
                    : "⬇"
                  : ""}
              </th>
              {mode === "shared" && <th>Participants</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mode === "private"
              ? sortedPrivateExpenses?.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{expense.amount}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.updatedAt.split("T")[0] +
                        "\n" +
                        expense.updatedAt.split("T")[1].split(".")[0]}
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
                          setShow(true);
                        }}
                      ></i>
                    </td>
                  </tr>
                ))
              : sortedSharedExpenses?.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{expense.amount}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.updatedAt.split("T")[0] +
                        "\n" +
                        expense.updatedAt.split("T")[1].split(".")[0]}
                    </td>
                    <td>
                      {/* Ensure unique usernames in sharedWith */}
                      {[
                        ...new Set(
                          expense.sharedWith.map((user) => user.username)
                        ),
                      ].join(", ")}
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
              <div className="form-group" style={{ display: "flex" }}>
                <label>Shared</label>
                <input
                  type="checkbox"
                  style={{
                    marginLeft: "10px",
                    marginBottom: "5px",
                    marginRight: "10px",
                  }}
                  checked={isShared}
                  onChange={() => setIsShared(!isShared)}
                />
                <i
                  className="bi bi-info-circle"
                  title="Check this button when you want to share this with other users.&#013;First you include your own username then click Add User or press Enter.&#013;Then you can add other users by their username. If the username doesnt exist, the user wont get added."
                ></i>
              </div>
              {isShared && (
                <>
                  <div className="form-group" style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={tempUser}
                      onChange={(e) => settempUser(e.target.value)}
                      style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
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
                    {[...new Set(sharedWith)].map((user, index) => (
                      <p
                        key={index}
                        style={{
                          borderBottom: "1px solid black",
                          width: "fit-content",
                          height: "fit-content",
                          margin: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {user}
                        <i
                          className="bi bi-trash dashboardActionIcons"
                          onClick={(e) => {
                            removeUser(user);
                          }}
                        ></i>
                      </p>
                    ))}
                  </div>
                </>
              )}
              <div className="form-actions" style={{ marginTop: "10px" }}>
                <Button
                  // variant="light"
                  size="sm"
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid black",
                  }}
                  onClick={() => {
                    clearExpenseInfo();
                    setShow(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  style={{ backgroundColor: "#333" }}
                  size="sm"
                  type="submit"
                >
                  {isEditing ? "Save Changes" : "Create"}
                </Button>
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
