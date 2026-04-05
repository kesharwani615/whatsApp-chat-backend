import { Server } from "socket.io";
import http from "http";
import express from "express";
import { checkValidToken } from "../services/helper.service.js";
import { twouserconversation } from "../models/conversation.modal.js";
import { groupconversation } from "../models/groupconversation.modal.js";
import { message } from "../models/message.modal.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  const token =
    socket?.handshake.headers?.authorization ||
    socket?.handshake.query?.authorization;

  let user;
  try {
    console.log("token",token);
    user = await checkValidToken(token);
    console.log("userValid", user);
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    socket.emit("error", { message: "Unauthorized - Invalid or No Token Provided" });
    return socket.disconnect();
  }

  socket.on("joinRoom", async ({ roomId, type }) => {
    let customRoom;
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

    console.log("existedConversation",existedConversation);

    const createdMessage = await message.create({
      senderId: user?._id,
      receiverId: roomId,
      message: usermessage,
    });
    console.log("createdMessage",createdMessage);
    if(!existedConversation?.message){
      existedConversation.message = [createdMessage?._id];
    }else{
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
      message:usermessage,
    });
  });
});

export { app, server };
