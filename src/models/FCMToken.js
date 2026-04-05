// models/FcmToken.js
import mongoose from 'mongoose';

const FcmTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FcmToken", FcmTokenSchema);
