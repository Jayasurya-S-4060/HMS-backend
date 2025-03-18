const Stripe = require("stripe");
const RoomHistory = require("../models/roomHistroy");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { costItems, currency, roomHistoryId } = req.body;

    if (!costItems?.length || !currency || !roomHistoryId) {
      return res.status(400).json({
        error: "Cost items, currency, and roomHistoryId are required.",
      });
    }

    const roomHistory = await RoomHistory.findById(roomHistoryId);

    if (roomHistory.paymentIntentId) {
      return res
        .status(400)
        .json({ error: "Payment already initiated for this room history." });
    }

    if (!roomHistory) {
      return res.status(404).json({ error: "Room history not found." });
    }

    const totalAmount =
      costItems.reduce((sum, item) => sum + item.amount, 0) * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency,
      metadata: {
        roomHistoryId: roomHistory._id.toString(),
        residentId: roomHistory.residentId?.toString() || "N/A",
        roomNumber: roomHistory.roomNumber?.toString() || "N/A",
        residentName: roomHistory.residentName || "N/A",
        checkOutTime: roomHistory.checkOutTime?.toISOString() || "N/A",
        checkInTime: roomHistory.checkInTime?.toISOString() || "N/A",
        costBreakdown: JSON.stringify(costItems),
      },
      automatic_payment_methods: { enabled: true },
    });

    roomHistory.paymentIntentId = paymentIntent.id;
    roomHistory.paymentStatus = "pending";
    await roomHistory.save();

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const roomHistories = await RoomHistory.find({ residentId: userId });

    if (!roomHistories.length) {
      return res
        .status(404)
        .json({ error: "No room history found for this user." });
    }

    const roomHistoryIds = roomHistories.map((room) => room._id.toString());

    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

    const userPayments = paymentIntents.data.filter(
      (pi) =>
        pi.metadata.residentId === userId ||
        (pi.metadata.roomHistoryId &&
          roomHistoryIds.includes(pi.metadata.roomHistoryId))
    );

    if (!userPayments.length) {
      return res
        .status(404)
        .json({ error: "No payments found for this user." });
    }

    // Format the response
    const formattedPayments = userPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      roomNumber: payment.metadata.roomNumber || "Unknown",
      checkOutTime: payment.metadata.checkOutTime || "N/A",
      costBreakdown: payment.metadata.costBreakdown
        ? JSON.parse(payment.metadata.costBreakdown)
        : [],
      client_secret: payment.client_secret,
      createdAt: payment.created,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ error: "Failed to retrieve payments." });
  }
};

const listAllPayments = async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({ limit: 100 });

    const formattedPayments = payments.data.map((payment) => ({
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency.toUpperCase(),
      status: payment.status,
      residentName: payment.metadata.residentName || "Unknown",
      roomNumber: payment.metadata.roomNumber || "N/A",
      createdAt: new Date(payment.created * 1000).toISOString(),
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
};

module.exports = { createPaymentIntent, getUserPayments, listAllPayments };
