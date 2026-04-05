import { Router } from "express";
import { createPaymentIntent, savePayment } from "../controller/payment.controller.js";

const router = Router();

router.post('/create-payment-intent', createPaymentIntent)

router.post('/save-payment', savePayment)

export default router;