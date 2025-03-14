const express = require("express");
const {
  createPaymentIntent,
  getUserPayments,
  listAllPayments,
} = require("../controllers/paymentController");

const paymentRouter = express.Router();

paymentRouter.get("/", listAllPayments);
paymentRouter.post("/create-intent", createPaymentIntent);
paymentRouter.get("/user-payments/:userId", getUserPayments);

module.exports = paymentRouter;
