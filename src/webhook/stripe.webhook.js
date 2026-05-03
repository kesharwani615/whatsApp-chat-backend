import express from "express";
import Stripe from "stripe";
import { createPaymentIntent } from "../controller/payment.controller.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const stripeWebhookHandler = (req, res) => {
    const sig = req.headers["stripe-signature"];

    console.log("ENV SECRET:", process.env.STRIPE_WEBHOOK_SECRET);
    console.log("HEADER SIGNATURE:", req.headers["stripe-signature"]);

    console.log("👉 isBuffer:", req.body instanceof Buffer); // MUST be true

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log("❌ Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Webhook received:", event.type);

    res.json({ received: true });
};
export default router;