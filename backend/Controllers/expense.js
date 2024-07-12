const User = require("../Models/user");
const Expense = require("../Models/expense");

const createExpense = async (req, res) => {
  const { userId, description, amount, date, category, sharedWith, isShared } =
    req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert usernames to ObjectIds
    let sharedWithIds = [];
    let updatedSharedWith = [];
    if (isShared && sharedWith && sharedWith.length > 0) {
      const sharedUsers = await User.find({ username: { $in: sharedWith } });
      sharedWithIds = sharedUsers.map((user) => user._id);
      updatedSharedWith = [user._id, ...sharedWithIds];

      // Check if all usernames were found
      if (sharedWith.length !== sharedWithIds.length) {
        return res.status(400).json({ message: "One or more users not found" });
      }
    }

    const newExpense = new Expense({
      description,
      amount,
      date,
      category,
      sharedWith: updatedSharedWith,
      isShared,
    });

    const savedExpense = await newExpense.save();

    // Add the expense to the user's private or shared expenses
    if (isShared) {
      user.sharedExpenses.push(savedExpense._id);
      if (sharedWithIds && sharedWithIds.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWithIds } },
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
    res.status(500).json({ message: error.message });
  }
};

const getExpensesByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
      .populate({
        path: "privateExpenses",
        populate: { path: "sharedWith", select: "username" },
      })
      .populate({
        path: "sharedExpenses",
        populate: { path: "sharedWith", select: "username" },
      });
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

const getSingleExpense = async (req, res) => {
  const expenseID = req.params.id;

  try {
    const expense = await Expense.findById(expenseID).populate(
      "sharedWith",
      "username"
    );

    if (!expense) {
      return res.status(404).json({ message: "expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expense = await Expense.find().populate("sharedWith", "username");
    if (!expense) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  const { userId, description, amount, date, category, isShared, sharedWith } =
    req.body;
  const { id: expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.description = description;
    expense.amount = amount;
    expense.date = date;
    expense.category = category;
    expense.isShared = isShared;
    expense.sharedWith = isShared ? sharedWith : [];

    const updatedExpense = await expense.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isShared) {
      if (!user.sharedExpenses.includes(expenseId)) {
        user.sharedExpenses.push(expenseId);
      }
      if (sharedWith && sharedWith.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWith } },
          { $addToSet: { sharedExpenses: expenseId } }
        );
      }
    } else {
      if (!user.privateExpenses.includes(expenseId)) {
        user.privateExpenses.push(expenseId);
      }
    }

    await user.save();

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  getSingleExpense,
};
