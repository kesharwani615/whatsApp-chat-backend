import 'dotenv/config'
import express from 'express';
import user from './src/routes/user.router.js'
import message from './src/routes/message.router.js'
import { database } from './src/services/db.js'
import { app, server as socketServer } from './src/socket/socketio.js';
import cloudinary from 'cloudinary'
import cors from 'cors'
import token from './src/controller/saveToken.js'
import { stripeWebhookHandler } from './src/webhook/stripe.webhook.js';
import PaymentRouter from './src/routes/payment.router.js';
// import "./src/config/redis.js";
import agoraRoutes from "./src/routes/agora.router.js";

const PORT = process.env.PORT || 1000;

// ✅ THIS IS CRITICAL
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);


app.use(express.json())

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}))

cloudinary.config({
  cloud_name: "dcfw2asl6",
  api_key: "544883643937728",
  api_secret: "tbvWfddTAQQjKgWcmPGtr-rfM7c"
})

app.use('/api/v1/user', user);

app.use('/api/v1/chat', message);

app.use('/api/v1/token', token);

app.use("/api/v1/payment", PaymentRouter)

app.use("/api/v1/agora", agoraRoutes);

app.get('/', (req, res) => {
  res.send("hello");
})

socketServer.listen(PORT, () => {
  database()
  console.log(`server is running ${PORT}`)
});