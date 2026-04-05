import mongoose from  "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model("Payment", PaymentSchema);