import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/Payement.modal.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log("Stripe Key:",process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = asyncHandler(async (req, res) => {
 const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to paise
      currency: "inr",
      payment_method_types: ["card"]
    });

    res.send({
      clientSecret: paymentIntent.client_secret
    });
});

export const savePayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, amount, status } = req.body;

  const payment = new Payment({
    paymentIntentId,
    amount,
    currency: "INR",
    status
  });

  await payment.save();
  res.json({ success: true });
});
