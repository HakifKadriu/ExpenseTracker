import api from "./api";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const Globalfunctions = () => {
  const history = useHistory();

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    history.push("/login");
  }, [history]);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await api.get("/user/" + localStorage.getItem("userID"));

      return response.data;
    } catch (error) {
      console.log("Error getting custom users");
    }
  }, []);

  const getUserExpenses = useCallback(async () => {
    try {
      const response = await api.get(
        "/expense/user/" + localStorage.getItem("userID")
      );

      // console.log(response.data)
      // return response.data.privateExpenses;
      return response.data;
    } catch (error) {
      console.log(error);
    }
  });



  const createExpense = useCallback(async (expenseData) => {
    // console.log("creating");
    try {
      await api
        .post("/expense/", expenseData)
        .then(() => {
          Swal.fire({
            title: "Expense Added Successfully!",
            icon: "success",
          });
        })
        .catch((err) => {
          Swal.fire({
            title: "Error!",
            text: err.response.data.message,
            icon: "error",
          });
        });
    } catch (error) {
      console.error("User save error", error.response.data);
    }
  });

  const editExpense = useCallback(async (expenseData) => {
    try {
      await api.put(`/expense/` + expenseData.expenseId, expenseData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      Swal.fire({
        title: "Edit Success!",
        icon: "success",
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response.data.message,
        icon: "error",
      });
    }
  });
  const deleteExpense = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure you want to delete this?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#FF0000",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (result.isConfirmed) {
        await api.delete("/expense/" + id);
        Swal.fire({
          title: "Deleted!",
          text: "The user has been deleted.",
          icon: "success",
        });
      }
    } catch (err) {
      console.error("Failed to delete user", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete user",
        icon: "error",
      });
    }
  });














  // const getSingleExpense = useCallback(async (expenseID) => {
  //   try {
  //     const response = await api.get("/expense/" + expenseID);

  //     // console.log(response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.log(error.response.data);
  //   }
  // });

  // const sendMessage = useCallback((msg) => {
  //   // this was done for testing
  //   try {
  //     console.log(msg);
  //   } catch (err) {
  //     console.error("Failed to delete user", err);
  //   }
  // });

  return {
    handleLogout,
    getCurrentUser,
    getUserExpenses,
    deleteExpense,
    // sendMessage,
    createExpense,
    editExpense,
    // getSingleExpense,
  };
};

export default Globalfunctions;
