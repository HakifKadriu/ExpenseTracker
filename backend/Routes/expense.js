const express = require("express");
const router = express.Router();
const expenseController = require("../Controllers/expense");

router.post("/", expenseController.createExpense);
router.get("/getAllExpenses", expenseController.getAllExpenses);
router.get("/user/:id", expenseController.getExpensesByUserId);
router.put("/", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
