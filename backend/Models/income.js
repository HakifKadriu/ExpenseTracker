const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Income", IncomeSchema);
