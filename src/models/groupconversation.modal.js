import mongoose, { Schema } from "mongoose";
import user from "./user.modal.js";
import { message } from "./message.modal.js";

const groupconversationSchema = new Schema({
  groupname: {
    type: String,
    require: true,
  },
  participant: [ 
    {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: user,
    },
  ], 
  roomId: {
    type: mongoose.Types.ObjectId,
    default: null,
    unique: true,
  },
  message: [
    {
      type: mongoose.Types.ObjectId,
      ref: message,
    },
  ],
  isRead: [
    {
      type: mongoose.Types.ObjectId,
      ref: user,
    },
  ],
  isGroup: {
    type: Boolean,
    require: true,
    default: true,
  },
  lastMessage: {
    type: String,
    require: true,
    default: "",
  },
  admin: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
});

groupconversationSchema.pre("save", function (next) {
  if (!this.roomId) {
    this.roomId = this._id;
  }
  next();
});

export const groupconversation = mongoose.model(
  "groupconversation",
  groupconversationSchema
);
