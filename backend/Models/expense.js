const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Expense = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "userModel" }],
    isShared: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("expenseModel", Expense);
