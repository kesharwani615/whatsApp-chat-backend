import { Server } from "socket.io";
import http from "http";
import express from "express";
import { checkValidToken, generateChannelName } from "../services/helper.service.js";
import { twouserconversation } from "../models/conversation.modal.js";
import { groupconversation } from "../models/groupconversation.modal.js";
import { message } from "../models/message.modal.js";
import { Call } from "../models/call.model.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map();

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  const token =
    socket?.handshake.headers?.authorization ||
    socket?.handshake.query?.authorization;

  let user;
  try {
    console.log("token", token);
    user = await checkValidToken(token);
    console.log("userValid", user);
    userSocketMap.set(user._id.toString(), socket.id);
    io.emit("allOnline-users", Array.from(userSocketMap.keys()));
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    socket.emit("error", { message: "Unauthorized - Invalid or No Token Provided" });
    return socket.disconnect();
  }

  socket.on("joinRoom", async ({ roomId, type }) => {
    let customRoom;
    console.log("map", userSocketMap);
    if (type === "single") {
      const sortedData = [String(user?._id), String(roomId)].sort();
      customRoom = `${sortedData[0]}-${sortedData[1]}`;

      const existedConversation = await twouserconversation.findOne({
        roomId: customRoom,
      });

      if (!existedConversation) {
        const createConversation = new twouserconversation({
          participant: [...sortedData],
          roomId: customRoom,
        });

        await createConversation.save();
      }
    } else if (type === "group") {
      const existedGroup = await groupconversation.findOne({ roomId: roomId });

      if (!existedGroup?.participant?.includes(user?._id)) {
        return socket.emit("group:accessDenied", {
          message: "You are not a member of this group!",
        });
      }
      customRoom = roomId;
    }

    socket.join(customRoom);
    console.log(`a user ${socket.id} join the room ${roomId}`);
  });

  socket.on("sendMessageSingle", async ({ roomId, usermessage }) => {
    console.log("sendMessageSingle", roomId, usermessage);

    const sortedData = [String(user?._id), String(roomId)].sort();
    console.log(`sortedData`, sortedData);
    const customRoom = `${sortedData[0]}-${sortedData[1]}`;

    const existedConversation = await twouserconversation.findOne({
      roomId: customRoom,
    });

    console.log("existedConversation", existedConversation);

    const createdMessage = await message.create({
      senderId: user?._id,
      receiverId: roomId,
      message: usermessage,
    });

    const receiverSocket = userSocketMap.get(roomId);
    if (receiverSocket) {
      await message.findByIdAndUpdate(createdMessage._id, { status: "delivered" });
    } else if (createdMessage._id) {
      await message.findByIdAndUpdate(createdMessage._id, { status: "sent" });
    }

    console.log("createdMessage", createdMessage);
    if (!existedConversation?.message) {
      existedConversation.message = [createdMessage?._id];
    } else {
      existedConversation.message = [
        ...(existedConversation.message || []),
        createdMessage?._id,
      ];
    }

    await existedConversation.save();

    io.to(customRoom).emit("receiveMessage", createdMessage);
  });

  socket.on("sendMessageGroup", async ({ roomId, usermessage }) => {
    const existedGroupConversation = await groupconversation.findOne({
      roomId: roomId,
    });

    if (!existedGroupConversation) {
      console.warn("Group conversation not found for roomId:", roomId);
      return socket.emit("error", { message: "Group not found!" });
    }

    const createdMessage = await message.create({
      senderId: user?._id,
      receiverId: roomId,
      message: usermessage,
    });

    existedGroupConversation.message = [
      ...(existedGroupConversation.message || []),
      createdMessage?._id,
    ];

    await existedGroupConversation.save();

    await existedGroupConversation.save();

    socket.to(roomId).emit("receiveMessage", {
      sender: socket.id,
      message: usermessage,
    });
  });

  socket.on("callUser", async ({ toUserId, callType = "video" }) => {
    const sortedIds = [String(user._id), String(toUserId)].sort();

    const roomId = `${sortedIds[0]}-${sortedIds[1]}`;
    const channelName = generateChannelName(user._id, toUserId);

    const call = await Call.create({
      roomId,
      channelName,
      participants: [user._id, toUserId],
      callerId: user._id,
      type: "single",
      callType,
      status: "initiated",
    });

    const receiverSocket = userSocketMap.get(toUserId);

    console.log("receiverSocket", userSocketMap);

    if (receiverSocket) {
      io.to(receiverSocket).emit("incomingCall", {
        callId: call._id,
        fromUser: user,
        channelName,
      });
    }
  });

  socket.on("acceptCall", async ({ callId }) => {
    const call = await Call.findByIdAndUpdate(
      callId,
      {
        status: "ongoing",
        receiverStatus: "accepted",
        startedAt: new Date(),
      },
      { new: true }
    );

    console.log("callAccepted", call);

    const participantsSocket = call.participants.map((userId) =>
      userSocketMap.get(userId.toString())
    );

    const receiverId = call.participants.find((userId) =>
      userId.toString() !== user._id.toString()
    );

    participantsSocket.forEach((socketId) => {
      console.log("socketId", socketId);
      if (socketId) {
        io.to(socketId).emit("callAccepted", {
          callId,
          receiverId: receiverId,
          channelName: call.channelName,
        });
      }
    });
  });

  socket.on("rejectCall", async ({ callId }) => {
    const call = await Call.findByIdAndUpdate(
      callId,
      {
        status: "ended",
        receiverStatus: "rejected",
      },
      { new: true }
    );

    socket.to(call.roomId).emit("callRejected", {
      callId,
    });
  });

  socket.on("endCall", async ({ callId }) => {
    const call = await Call.findById(callId);

    const endTime = new Date();

    await Call.findByIdAndUpdate(callId, {
      status: "ended",
      endedAt: endTime,
      duration: (endTime - call.startedAt) / 1000,
    });

    socket.to(call.roomId).emit("callEnded");
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("show_typing", {
      userName,
      message: `${userName} is typing...`
    });
  });

  socket.on("stop_typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("hide_typing", {
      userName,
    });
  });

  socket.on("disconnect", () => {
    if (user?._id) {
      userSocketMap.delete(user._id.toString());
      // Broadcast the updated online list to all remaining connected clients
      io.emit("allOnline-users", Array.from(userSocketMap.keys()));
    }
    console.log("a user disconnected", socket.id);
  });


});

export { app, server };
