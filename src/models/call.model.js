import mongoose, { Schema } from "mongoose";

const callSchema = new Schema({
    roomId: {
        type: String,
        required: true,
    },

    channelName: {
        type: String,
        required: true,
    },

    participants: [
        {
            type: mongoose.Types.ObjectId,
            ref: "user",
        },
    ],

    callerId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },

    type: {
        type: String,
        enum: ["single", "group"],
        required: true,
    },

    callType: {
        type: String,
        enum: ["video", "audio"],
        default: "video",
    },

    status: {
        type: String,
        enum: ["initiated", "ongoing", "ended", "missed"],
        default: "initiated",
    },

    receiverStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected", "missed"],
        default: "pending",
    },

    startedAt: Date,
    endedAt: Date,

    duration: Number, // seconds

}, { timestamps: true });

// 🔥 indexes
callSchema.index({ roomId: 1 });
callSchema.index({ participants: 1 });

export const Call = mongoose.model("Call", callSchema);