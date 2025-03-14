const FinancialRecord = require("../models/financialReport.js");

// Add a new financial record
const addFinancialRecord = async (req, res) => {
  try {
    const { type, amount, date, description, occupancyRate } = req.body;

    const newRecord = new FinancialRecord({
      type,
      amount,
      date,
      description,
      occupancyRate: type === "occupancy" ? occupancyRate : null,
    });

    await newRecord.save();
    res
      .status(201)
      .json({ message: "Financial record added", data: newRecord });
  } catch (error) {
    res.status(500).json({ message: "Error adding financial record", error });
  }
};

// Get all financial records
const getFinancialRecords = async (req, res) => {
  try {
    const records = await FinancialRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error });
  }
};

// Update an existing financial record
const updateFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, date, description, occupancyRate } = req.body;

    const updatedRecord = await FinancialRecord.findByIdAndUpdate(
      id,
      { type, amount, date, description, occupancyRate },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res
      .status(200)
      .json({ message: "Financial record updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: "Error updating financial record", error });
  }
};

// Generate financial report (aggregated revenue, expenses, occupancy rate)
const generateFinancialReport = async (req, res) => {
  try {
    const records = await FinancialRecord.find();

    let totalRevenue = 0;
    let totalExpenses = 0;

    records.forEach((record) => {
      if (record.type === "Revenue") totalRevenue += record.amount;
      if (record.type === "Expense") totalExpenses += record.amount;
    });

    res.status(200).json({
      totalRevenue: totalRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
};
const deleteFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await FinancialRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Financial record not found" });
    }

    res.status(200).json({ message: "Financial record successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting financial record", error });
  }
};

module.exports = {
  deleteFinancialRecord,
  getFinancialRecords,
  addFinancialRecord,
  generateFinancialReport,
  updateFinancialRecord,
};
