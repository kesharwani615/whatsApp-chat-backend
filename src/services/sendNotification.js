// server/sendNotification.js
import 'dotenv/config';
import admin from 'firebase-admin';
// import serviceAccount from '../firebase/serviceAccountKey.js';

let messaging;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    messaging = admin.messaging();
    return;
  }

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  messaging = admin.messaging();
}

// ✅ send to single token (data-only message for full control)
export async function sendToDevice(token, notification) {
  if (!messaging) initializeFirebase();
  const message = {
    tokens: [token],
    data: {
      // title/body ab data me jaayenge
      title: notification.title,
      body: notification.body,
      ...(notification.data || {}) // extra custom key-values
    }
  };

  console.log("message:", message);

  // multicase because tokens[] use kar rahe ho
  return messaging.sendEachForMulticast(message);
}

// ✅ topic ke liye bhi same pattern rakh sakte ho:
export async function sendToTopic(topic, notification) {
  if (!messaging) initializeFirebase();
  const message = {
    topic,
    data: {
      title: notification.title,
      body: notification.body,
      ...(notification.data || {})
    }
  };

  return messaging.send(message);
}
