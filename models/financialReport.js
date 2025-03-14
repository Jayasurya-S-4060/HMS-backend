const mongoose = require("mongoose");

const financialReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Revenue", "Expense"],
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
  description: {
    type: String,
  },
});

const FinancialReport = mongoose.model(
  "FinancialReport",
  financialReportSchema
);

module.exports = FinancialReport;
