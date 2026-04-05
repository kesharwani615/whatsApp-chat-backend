import mongoose, { Schema } from "mongoose";
import user from "./user.modal.js";

const messageSchema = new Schema({
      senderId:{
        type:mongoose.Types.ObjectId,
        require:true,
        ref:user,
      },
      receiverId:{
       type:mongoose.Types.ObjectId,
        require:true,
        ref:user,
      },
      message:{
        type:String,
        require:true,
      },
      isRead:[{
        type:mongoose.Types.ObjectId,
        ref:user
      }]
},{timestamps:true});

export const message = mongoose.model("message",messageSchema);