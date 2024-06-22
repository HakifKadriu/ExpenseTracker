const User = require("../Models/user");
const Expense = require("../Models/expense");

// Create a new expense
const createExpense = async (req, res) => {
  const { userId, description, amount, category, sharedWith, isShared } =
    req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newExpense = new Expense({
      description,
      amount,
      category,
      sharedWith,
      isShared,
    });

    const savedExpense = await newExpense.save();

    // Add the expense to the user's private or shared expenses
    if (isShared) {
      user.sharedExpenses.push(savedExpense._id);
      if (sharedWith && sharedWith.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWith } },
          { $push: { sharedExpenses: savedExpense._id } }
        );
      }
    } else {
      user.privateExpenses.push(savedExpense._id);
    }

    await user.save();

    res
      .status(201)
      .json({ message: "Expense created successfully", expense: savedExpense });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getExpensesByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
      .populate("privateExpenses")
      .populate("sharedExpenses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      privateExpenses: user.privateExpenses,
      sharedExpenses: user.sharedExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expense = await Expense.find();
    if (!expense) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  const { expenseId, description, amount, category, sharedWith, isShared } =
    req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.sharedWith = sharedWith || expense.sharedWith;
    expense.isShared = isShared !== undefined ? isShared : expense.isShared;

    const updatedExpense = await expense.save();

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Remove the expense from users' shared expenses
    if (expense.isShared && expense.sharedWith.length > 0) {
      await User.updateMany(
        { _id: { $in: expense.sharedWith } },
        { $pull: { sharedExpenses: expenseId } }
      );
    }

    // Remove the expense from the user's private expenses
    await User.updateOne(
      { privateExpenses: expenseId },
      { $pull: { privateExpenses: expenseId } }
    );

    await Expense.deleteOne({ _id: expenseId });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getExpensesByUserId,
  updateExpense,
  deleteExpense,
  getAllExpenses,
};
