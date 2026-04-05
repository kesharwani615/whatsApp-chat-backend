import express from 'express';
import dotenv from 'dotenv'
import user from './src/routes/user.router.js'
import message from './src/routes/message.router.js'
import {database} from './src/services/db.js'
import { app, server as socketServer } from './src/socket/socketio.js';
import cloudinary from 'cloudinary'
import cors from 'cors'
import token from './src/controller/saveToken.js'
import notification from './src/controller/send-notification.js'
import serviceAccount from './src/firebase/serviceAccountKey.js'
import admin from 'firebase-admin'
import PaymentRouter from './src/routes/payment.router.js';

dotenv.config()

const PORT = process.env.PORT || 1000;

app.use(express.json())

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.use(cors({
  origin: ["http://localhost:3000","http://localhost:5173"],
  credentials: true
}))

cloudinary.config({
    cloud_name: "dcfw2asl6",
    api_key: "544883643937728",
    api_secret: "tbvWfddTAQQjKgWcmPGtr-rfM7c"
})

app.use('/api/v1/user',user);

app.use('/api/v1/chat',message);

app.use('/api/v1/token',token);

app.use('/api/v1/notification',notification);

app.use("/api/v1/payment",PaymentRouter)

app.get('/',(req,res)=>{
  res.send("hello");    
})

socketServer.listen(PORT,()=>{
    database()
    console.log(`server is running ${PORT}`)
});