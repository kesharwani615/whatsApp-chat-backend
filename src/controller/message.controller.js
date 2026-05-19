import mongoose from "mongoose";
import { groupconversation } from "../models/groupconversation.modal.js";
import { message } from "../models/message.modal.js";
import user from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { errorHandler } from "../utils/errorResponseHandler.js";
import { twouserconversation } from "../models/conversation.modal.js";

export const createGroup = asyncHandler(async (req, res) => {
  const { groupname, participant } = req.body;

  if (!groupname) throw new ApiError(400, "Please provide group name!");

  if (!(Array.isArray(participant) && participant?.length > 0))
    throw new ApiError(400, "A group should contain more than 1 member!");

  const Createdgroup = new groupconversation({
    groupname: groupname,
    participant: [...participant, req.user?._id],
    admin: req.user?._id,
  });

  await Createdgroup.save();

  res.status(200).json({ message: "group created successfully!" });
});

export const getconversation = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const allgroup = await groupconversation.aggregate([
    { $match: { participant: { $in: [loggedInUser?._id] } } },
  ]);

  const alluser = await message.aggregate([
    { $match: { senderId: loggedInUser?._id } },
    {
      $group: { _id: "$receiverId" },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "receviedUser",
      },
    },
    {
      $unwind: "$receviedUser",
    },
    {
      $replaceRoot: {
        newRoot: "$receviedUser",
      },
    },
  ]);

  res.status(200).json({ data: { group: allgroup, users: alluser } });
});

export const getalluser = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const alluser = await user.aggregate([
    {
      $match: { _id: { $ne: new mongoose.Types.ObjectId(loggedInUser?._id) } },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        username: 1,
        mobileNumber: 1,
      }
    }
  ]);

  res.status(200).json({ data: alluser });
});

export const getallgroup = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const allgroup = await groupconversation.aggregate([{ $match: { participant: { $in: [loggedInUser?._id] } } }]);

  res.status(200).json({ allgroup: allgroup });
});

export const addparticipantingroup = asyncHandler(async (req, res) => {
  const { groupId, id } = req.body;

  const existedUser = await user.findOne({ _id: id });

  if (!existedUser) throw new ApiError(400, "this user does not exist!");

  const group = await groupconversation.findOne({ _id: groupId });

  console.log("group1:", group);

  if (group.participant?.includes(id)) {
    throw new ApiError(400, "user already existed in group!");
  }

  group.participant.push(id);

  console.log("group2:", group);

  const userAdded = await group.save();

  console.log("userAdded:", group, userAdded)

  if (!userAdded) throw new ApiError(500, "user not added in group, something went worng!");

  res.status(201).json({ message: "user added successfully!" });
})

export const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId, id } = req.body;

  const existedUser = await user.findOne({ _id: id });

  if (!existedUser) throw new ApiError(400, "this user does not exist!");

  const group = await groupconversation.findOne({ _id: groupId });

  if (!(group.participant?.includes(id))) {
    throw new ApiError(400, "user does not exist in this group!");
  }

  const updateParticipant = group.participant?.filter((item) => !item.equals(id));

  group.participant = [...updateParticipant];

  console.log("group2:", updateParticipant);

  const userAdded = await group.save();

  if (!userAdded) throw new ApiError(500, "something went worng, while leaving group!");

  res.status(201).json({ message: "user leaved the group successfully!" });
});

export const getUserChat = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { userId } = req.params;

  console.log(userId);

  if (!userId) {
    return errorHandler(res, 400, false, "User ID is required to get chat!");
  }

  // Update status to read for any unread messages received by the loggedInUser from this sender
  await message.updateMany(
    { senderId: userId, receiverId: loggedInUser._id, status: { $ne: "read" } },
    { $set: { status: "read" } }
  );

  const customRoom = await twouserconversation.findOne({ participant: { $all: [loggedInUser._id, userId] } });

  const userChat = await message.find({
    $or: [
      { senderId: loggedInUser._id, receiverId: userId },
      { senderId: userId, receiverId: loggedInUser._id }
    ]
  }).sort({ createdAt: 1 })



  if (!userChat || userChat.length === 0) {
    return res.status(200).json({ message: "No chat found with this user!" });
  }

  res.status(200).json({ data: userChat, roomId: customRoom?.roomId });
})