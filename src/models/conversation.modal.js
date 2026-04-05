import mongoose, { Schema } from "mongoose";
import user from "./user.modal.js";
import { message } from "./message.modal.js";

const conversation = new Schema({
    participant:[{
        type:mongoose.Types.ObjectId,
        require:true,
        ref:user,
    }], 
    roomId:{
        type:String,
        require:true,
        unique:true,
    },
    message:[{
        type:mongoose.Types.ObjectId,
        ref:message
    }]
});

export const twouserconversation = mongoose.model("twouserconversation",conversation);
