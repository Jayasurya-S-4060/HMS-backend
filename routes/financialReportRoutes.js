const express = require("express");

const {
  addFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
  generateFinancialReport,
  deleteFinancialRecord,
} = require("../controllers/financialReportControler");

const financialRouter = express.Router();

financialRouter.get("/report", generateFinancialReport);
financialRouter.post("/", addFinancialRecord);
financialRouter.get("/", getFinancialRecords);
financialRouter.put("/:id", updateFinancialRecord);
financialRouter.delete("/:id", deleteFinancialRecord);

module.exports = financialRouter;
