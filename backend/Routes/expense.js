const express = require("express");
const router = express.Router();
const expenseController = require("../Controllers/expense");
const expense = require("../Models/expense");

router.post("/", expenseController.createExpense);
router.get("/getAllExpenses", expenseController.getAllExpenses);
router.get("/:id", expenseController.getSingleExpense);
router.get("/user/:id", expenseController.getExpensesByUserId);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);


module.exports = router;
