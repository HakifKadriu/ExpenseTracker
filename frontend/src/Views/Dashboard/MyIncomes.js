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
  } = Globalfunctions();

  const [privateIncomes, setPrivateIncomes] = useState([]);
  const [sharedIncomes, setSharedIncomes] = useState([]);
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState("");
  // const [currentUserUsername, setCurrentUserUsername] = useState("");
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
      setSortOrder(-sortOrder); // asc -> -sortorder = desc
    } else {
      setSortKey(key);
      setSortOrder(1); // Default to ascending
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

    if (sharedWith.length === 0) {
      setIsShared(false);
    } else {
      setIsShared(true);
    }
  }, [sharedWith]);

  const fetchIncomes = async () => {
    try {
      const result = await getUserIncomes();
      setPrivateIncomes(result.privateIncomes);
      setSharedIncomes(result.sharedIncomes);
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
      isShared: sharedWith.length > 0,
      sharedWith: isShared ? sharedWith : [],
    };

    try {
      let response;
      if (isEditing) {
        response = await editIncome(incomeData);
      } else {
        response = await createIncome(incomeData);
      }
      setShow(false);
      clearIncomeInfo();
      fetchIncomes();
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

  const checkIfEnteronArray = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      setSharedWith([...sharedWith, tempUser]);
      setTempUser("");
    }
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
              <th style={{ textAlign: "center" }}>Actions</th>
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
                          fetchIncomes();
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
                          fetchIncomes();
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
                      onChange={(e) => setTempUser(e.target.value)}
                      style={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                      onKeyDown={(e) => checkIfEnteronArray(e)}
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
                        borderTopRightRadius: "10px",
                        borderBottomRightRadius: "10px",
                      }}
                    >
                      Add User
                    </button>
                  </div>
                  Shared with:
                  <div
                    style={{
                      border: "1px solid black",
                      borderRadius: "5px",
                      padding: "10px",
                      overflowY: "scroll",
                      height: "10rem",
                      scrollSnapType: "y proximity"
                    }}
                  >
                    {[...new Set(sharedWith)].map((user, index) => (
                      <p key={index} className="sharedWithUsers">
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
              <div
                className="modal-footer"
                style={{ gap: "5px", marginTop: "10px" }}
              >
                <Button
                  // variant="light"
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid black",
                  }}
                  onClick={() => {
                    clearIncomeInfo();
                    setShow(false);
                  }}
                >
                  Close
                </Button>
                <Button variant="dark" type="submit">
                  {isEditing ? "Save Changes" : "Create"}
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
