import mongoose, { Schema } from "mongoose";
import user from "./user.modal.js";

const messageSchema = new Schema({

  senderId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "user",
  },

  receiverId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "user",
  },

  message: {
    type: String,
    required: true,
  },

  // Message Status
  status: {
    type: String,
    enum: ["pending", "sent", "delivered", "read"],
    default: "pending",
  },
}, { timestamps: true });

export const message = mongoose.model("message", messageSchema);