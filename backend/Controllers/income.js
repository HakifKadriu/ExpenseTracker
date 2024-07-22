const User = require("../Models/user");
const Income = require("../Models/income");

const createIncome = async (req, res) => {
  const { userId, description, amount, date, category, sharedWith, isShared } =
    req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // me shti emrin e current user nparticipants
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

      if (sharedWith.length !== sharedWithIds.length) {
        return res.status(400).json({ message: "One or more users not found" });
      }
    }

    const newIncome = new Income({
      description,
      amount,
      date,
      category,
      sharedWith: updatedSharedWith,
      isShared,
    });

    const savedIncome = await newIncome.save();

    if (isShared) {
      if (!user.sharedIncomes.includes(savedIncome._id)) {
        user.sharedIncomes.push(savedIncome._id);
        await user.save();
      }

      if (sharedWithIds && sharedWithIds.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWithIds } },
          { $addToSet: { sharedIncomes: savedIncome._id } }
        );
      }
    } else {
      if (!user.privateIncomes.includes(savedIncome._id)) {
        user.privateIncomes.push(savedIncome._id);
        await user.save();
      }
    }

    res
      .status(201)
      .json({ message: "Income created successfully", income: savedIncome });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIncomesByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId)
      .populate({
        path: "privateIncomes",
        populate: { path: "sharedWith", select: "username" },
      })
      .populate({
        path: "sharedIncomes",
        populate: { path: "sharedWith", select: "username" },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = user.username;

    // merri shared Incomes te cilat useri osht participant
    const filteredSharedIncomes = user.sharedIncomes.filter((expense) =>
      expense.sharedWith.some(
        (participant) => participant.username === username
      )
    );

    res.status(200).json({
      privateIncomes: user.privateIncomes,
      sharedIncomes: filteredSharedIncomes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleIncome = async (req, res) => {
  const incomeId = req.params.id;

  try {
    const income = await Income.findById(incomeId).populate(
      "sharedWith",
      "username"
    );

    if (!income) {
      return res.status(404).json({ message: "income not found" });
    }

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllIncomes = async (req, res) => {
  try {
    const income = await Income.find().populate("sharedWith", "username");
    if (!income) {
      return res.status(404).json({ message: "income not found" });
    }

    res.status(200).json(income);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateIncome = async (req, res) => {
  let { userId, description, amount, date, category, isShared, sharedWith } =
    req.body;
  const { id: incomeId } = req.params;

  try {
    const income = await Income.findById(incomeId);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // // Check if current user's username needs to be added to sharedWith
    // if (isShared && !sharedWith.includes(user.username)) {
    //   sharedWith.push(user.username);
    // }

    // Convert sharedWith usernames to ObjectIds
    let sharedWithIds = [];
    if (isShared && sharedWith.length > 0) {
      const users = await User.find({ username: { $in: sharedWith } });
      sharedWithIds = users.map((user) => user._id);
      // console.log(sharedWithIds);
    }

    // nese participant osht vetem currentUser atehere bone privat
    if (sharedWithIds.length === 1 && sharedWithIds[0].toString() === userId) {
      income.isShared = false;
      income.sharedWith = [];
      isShared = false;
    } else {
      income.isShared = isShared;
      income.sharedWith = sharedWithIds;
    }

    income.description = description;
    income.amount = amount;
    income.date = date;
    income.category = category;

    const updatedIncome = await income.save();

    // nese ni private income e bajna edit ne isShared=true atehere zhvendose ne shared incomes
    if (isShared) {
      income.sharedWith = sharedWithIds;
      user.privateIncomes = user.privateIncomes.filter(
        (id) => id.toString() !== incomeId
      );
      if (!user.sharedIncomes.includes(incomeId)) {
        user.sharedIncomes = [...user.sharedIncomes, incomeId];
      }

      if (sharedWithIds.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWithIds } },
          { $addToSet: { sharedIncomes: incomeId } }
        );
      }
    } else {
      user.sharedIncomes = user.sharedIncomes.filter(
        (id) => id.toString() !== incomeId
      );
      if (!user.privateIncomes.includes(incomeId)) {
        user.privateIncomes.push(incomeId);
      }
      if (income.sharedWith.length > 0) {
        await User.updateMany(
          { _id: { $in: income.sharedWith } },
          { $pull: { sharedIncomes: incomeId } }
        );
      }
    }

    await user.save();

    res.status(200).json({
      message: "Income updated successfully",
      income: updatedIncome,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  const incomeId = req.params.id;

  try {
    const income = await Income.findById(incomeId);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.isShared && income.sharedWith.length > 0) {
      await User.updateMany(
        { _id: { $in: income.sharedWith } },
        { $pull: { sharedIncomes: incomeId } }
      );
    }

    await User.updateOne(
      { privateIncomes: incomeId },
      { $pull: { privateIncomes: incomeId } }
    );

    await Income.deleteOne({ _id: incomeId });

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createIncome,
  getIncomesByUserId,
  updateIncome,
  deleteIncome,
  getAllIncomes,
  getSingleIncome,
};
