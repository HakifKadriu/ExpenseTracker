const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  privateExpenses: [{ type: Schema.Types.ObjectId, ref: 'expenseModel' }],
  sharedExpenses: [{ type: Schema.Types.ObjectId, ref: "expenseModel" }],
  privateIncomes: [{ type: Schema.Types.ObjectId, ref: "Income" }],
  sharedIncomes: [{ type: Schema.Types.ObjectId, ref: "Income" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

User.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("userModel", User);
