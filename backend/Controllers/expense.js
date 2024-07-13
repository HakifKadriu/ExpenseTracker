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

    // Ensure the current user's username is added to sharedWith if the expense is shared
    if (isShared && !sharedWith.includes(user.username)) {
      sharedWith.push(user.username);
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
      if (!sharedWith.includes(user.username)) {
        user.sharedExpenses.push(savedExpense._id);
        await user.save();
      }

      if (sharedWithIds && sharedWithIds.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWithIds } },
          { $addToSet: { sharedExpenses: savedExpense._id } }
        );
      }
    } else {
      user.privateExpenses.push(savedExpense._id);
      await user.save();
    }

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

    // Assuming the username is stored in user.username
    const username = user.username;

    // Filter shared expenses to include only those where the current user is a participant
    const filteredSharedExpenses = user.sharedExpenses.filter((expense) =>
      expense.sharedWith.some(
        (participant) => participant.username === username
      )
    );

    res.status(200).json({
      privateExpenses: user.privateExpenses,
      sharedExpenses: filteredSharedExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  let { userId, description, amount, date, category, isShared, sharedWith } =
    req.body; // Change `const` to `let`
  const { id: expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert sharedWith usernames to ObjectIds
    let sharedWithIds = [];
    if (isShared && sharedWith.length > 0) {
      const users = await User.find({ username: { $in: sharedWith } });
      sharedWithIds = users.map((user) => user._id);
    }

    // Check if the sharedWith array contains only the current user
    if (sharedWithIds.length === 1 && sharedWithIds[0].toString() === userId) {
      expense.isShared = false;
      expense.sharedWith = [];
      isShared = false; // Update isShared to reflect the change in the expense
    } else {
      expense.isShared = isShared;
      expense.sharedWith = sharedWithIds;
    }

    expense.description = description;
    expense.amount = amount;
    expense.date = date;
    expense.category = category;

    const updatedExpense = await expense.save();

    if (isShared) {
      // Remove from privateExpenses if it exists
      user.privateExpenses = user.privateExpenses.filter(
        (id) => id.toString() !== expenseId
      );
      // Add to sharedExpenses if not already present
      if (!user.sharedExpenses.includes(expenseId)) {
        user.sharedExpenses.push(expenseId);
      }
      // Add the expense to each user in sharedWith
      if (sharedWithIds && sharedWithIds.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWithIds } },
          { $addToSet: { sharedExpenses: expenseId } }
        );
      }
    } else {
      // Remove from sharedExpenses if it exists
      user.sharedExpenses = user.sharedExpenses.filter(
        (id) => id.toString() !== expenseId
      );
      // Add to privateExpenses if not already present
      if (!user.privateExpenses.includes(expenseId)) {
        user.privateExpenses.push(expenseId);
      }
      // Remove the expense from sharedExpenses of users in sharedWith
      if (expense.sharedWith.length > 0) {
        await User.updateMany(
          { _id: { $in: expense.sharedWith } },
          { $pull: { sharedExpenses: expenseId } }
        );
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
