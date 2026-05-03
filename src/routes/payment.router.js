import { Router } from "express";
import { createPaymentIntent, savePayment } from "../controller/payment.controller.js";
import Stripe from "stripe";
import express from "express";
import { Payment } from "../models/Payement.modal.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', createPaymentIntent)

router.post('/save-payment', savePayment)

// ✅ Webhook (MOST IMPORTANT)
// router.post(
//     "/webhook",
//     express.raw({ type: "application/json" }), // ✅ MUST
//     (req, res) => {
//         const sig = req.headers["stripe-signature"];

//         let event;

//         try {
//             event = stripe.webhooks.constructEvent(
//                 req.body,
//                 sig,
//                 process.env.STRIPE_WEBHOOK_SECRET
//             );
//         } catch (err) {
//             console.log("❌ Webhook Error:", err.message);
//             return res.status(400).send(`Webhook Error: ${err.message}`);
//         }

//         console.log("✅ Webhook received:", event.type);

//         res.json({ received: true });
//     }
// );

export default router;