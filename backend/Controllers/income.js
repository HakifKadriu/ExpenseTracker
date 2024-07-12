const Income = require("../Models/income");
const User = require("../Models/user");

const createIncome = async (req, res) => {
  const { userId, description, amount, date, category, isShared, sharedWith } =
    req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newIncome = new Income({
      userId,
      description,
      amount,
      date,
      category,
      isShared,
      sharedWith: isShared ? sharedWith : [],
    });

    const savedIncome = await newIncome.save();

    if (!user.privateIncomes) {
      user.privateIncomes = [];
    }
    if (!user.sharedIncomes) {
      user.sharedIncomes = [];
    }

    // Add the income to users incomes
    if (isShared) {
      user.sharedIncomes.push(savedIncome._id);
      if (sharedWith && sharedWith.length > 0) {
        await User.updateMany(
          { _id: { $in: sharedWith } },
          { $push: { sharedIncomes: savedIncome._id } }
        );
      }
    } else {
      user.privateIncomes.push(savedIncome._id);
    }

    await user.save();

    res
      .status(201)
      .json({ message: "Income created successfully", income: savedIncome });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIncomesByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const incomes = await Income.find({ userId });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleIncomeById = async (req, res) => {
  const { id } = req.params;

  try {
    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIncome = async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category, isShared, sharedWith } =
    req.body;

  try {
    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    income.description = description;
    income.amount = amount;
    income.date = date;
    income.category = category;
    income.isShared = isShared;
    income.sharedWith = isShared ? sharedWith : [];

    const updatedIncome = await income.save();

    res
      .status(200)
      .json({ message: "Income updated successfully", income: updatedIncome });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  const { id } = req.params;

  try {
    const income = await Income.findByIdAndDelete(id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    // Remove the income from users incomes
    await User.updateMany(
      { $or: [{ privateIncomes: id }, { sharedIncomes: id }] },
      { $pull: { privateIncomes: id, sharedIncomes: id } }
    );

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllIncomes = async (req, res) => {
  try {
    const income = await Income.find();

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createIncome,
  getIncomesByUserId,
  getSingleIncomeById,
  updateIncome,
  deleteIncome,
  getAllIncomes,
};
