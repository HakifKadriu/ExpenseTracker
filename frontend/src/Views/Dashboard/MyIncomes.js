import React, { useEffect, useState } from "react";
import "./MyIncomes.css";
import api from "../../api";
import Sidebar from "../Sidebar/Sidebar";
import Table from "react-bootstrap/Table";
import Globalfunctions from "../../globalfunctions";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";

const IncomesDashboard = () => {
  const { mode } = useParams();
  const {
    getUserIncomes,
    deleteIncome,
    createIncome,
    editIncome,
    getCurrentUser,
  } = Globalfunctions();

  const [privateIncomes, setPrivateIncomes] = useState([]);
  const [sharedIncomes, setSharedIncomes] = useState([]);
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [tempIncomeId, setTempIncomeId] = useState("");

  const [userId, setCurrentUserId] = useState(localStorage.getItem("userID"));
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
      setSortOrder(-sortOrder); // Reverse sort order if same key clicked again
    } else {
      setSortKey(key);
      setSortOrder(1); // Default to ascending order on first click
    }
  };

  const sortedPrivateIncomes = [...privateIncomes].sort((a, b) => {
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

  const sortedSharedIncomes = [...sharedIncomes].sort((a, b) => {
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
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const result = await getUserIncomes();
      setPrivateIncomes(result.privateIncomes);
      setSharedIncomes(result.sharedIncomes);
      console.log("Fetched Incomes: ", result); // Debug log
    } catch (error) {
      console.error("Error fetching incomes: ", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const incomeData = {
      userId,
      incomeId: tempIncomeId,
      description,
      amount,
      date,
      category,
      isShared,
      sharedWith: isShared ? sharedWith : [],
    };

    try {
      let response;
      if (isEditing) {
        response = await editIncome(incomeData);
      } else {
        response = await createIncome(incomeData);
      }
      console.log("API Response: ", response); // Debug log
      setShow(false);
      clearIncomeInfo();
      fetchIncomes(); // Fetch latest incomes after update
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response.data.message,
        icon: "error",
      });
    }
  };

  const clearIncomeInfo = () => {
    setDescription("");
    setAmount(0);
    setDate("");
    setCategory("");
    setIsShared(false);
    setSharedWith([]);
    setIsEditing(false);
    setTempIncomeId("");
  };

  const getSingleIncome = async (incomeId) => {
    try {
      const response = await api.get("/income/" + incomeId);
      console.log("Single Income: ", response.data); // Debug log

      if (response.data) {
        setDescription(response.data.description);
        setAmount(response.data.amount);
        setDate(response.data.date.split("T")[0]);
        setCategory(response.data.category);
        setIsShared(response.data.isShared);
        setSharedWith(response.data.sharedWith.map((user) => user.username));
        setTempIncomeId(response.data._id);
        setShow(true);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching single income: ", error.response.data);
    }
  };

  const removeUser = (username) => {
    setSharedWith(sharedWith.filter((user) => user !== username));
  };

  return (
    <div className="dashboardBody">
      <Sidebar />
      <div className="dashboardRightSide">
        <h2 style={{ alignSelf: "center" }}>
          {mode === "private" ? "Private Incomes" : "Shared Incomes"}
        </h2>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort("description")}>Description</th>
              <th onClick={() => handleSort("amount")}>Amount</th>
              <th onClick={() => handleSort("date")}>Date</th>
              <th onClick={() => handleSort("category")}>Category</th>
              <th onClick={() => handleSort("lastUpdatedOn")}>
                Last Updated On
              </th>
              {mode === "shared" && <th>Participants</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mode === "private"
              ? sortedPrivateIncomes?.map((income) => (
                  <tr key={income.id}>
                    <td>{income.description}</td>
                    <td>{income.amount}</td>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>{income.category}</td>
                    <td>
                      {income.updatedAt.split("T")[0] +
                        "\n" +
                        income.updatedAt.split("T")[1].split(".")[0]}
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
                        onClick={async () => {
                          await deleteIncome(income._id);
                          fetchIncomes(); // Fetch incomes after delete
                        }}
                      ></i>
                      <i
                        className="bi bi-pencil-square dashboardActionIcons"
                        onClick={async () => {
                          await getSingleIncome(income._id);
                          setShow(true);
                        }}
                      ></i>
                    </td>
                  </tr>
                ))
              : sortedSharedIncomes?.map((income) => (
                  <tr key={income.id}>
                    <td>{income.description}</td>
                    <td>{income.amount}</td>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>{income.category}</td>
                    <td>
                      {income.updatedAt.split("T")[0] +
                        "\n" +
                        income.updatedAt.split("T")[1].split(".")[0]}
                    </td>
                    <td>
                      {/* Ensure unique usernames in sharedWith */}
                      {[
                        ...new Set(
                          income.sharedWith.map((user) => user.username)
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
                        onClick={async () => {
                          await deleteIncome(income._id);
                          fetchIncomes(); // Fetch incomes after delete
                        }}
                      ></i>
                      <i
                        className="bi bi-pencil-square dashboardActionIcons"
                        onClick={async () => {
                          await getSingleIncome(income._id);
                          setShow(true);
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
        Add Income <i className="bi bi-plus-circle"></i>
      </div>

      {show && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              {isEditing ? <h2>Edit Income</h2> : <h2>Create Income</h2>}
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
                  Shared
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                  />
                </label>
              </div>
              {isShared && (
                <>
                  <div className="form-group" style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={tempUser}
                      onChange={(e) => setTempUser(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSharedWith([...sharedWith, tempUser]);
                        setTempUser("");
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
                    {sharedWith?.map((user, index) => (
                      <p
                        key={index}
                        style={{
                          borderBottom: "1px solid black",
                          width: "fit-content",
                          height: "fit-content",
                          margin: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                          width: "95%",
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
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearIncomeInfo();
                    setShow(false);
                  }}
                >
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomesDashboard;
