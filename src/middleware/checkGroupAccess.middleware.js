import { groupconversation } from "../models/groupconversation.modal.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkAccessForGroup = asyncHandler(async(req,res,next)=>{
    const loggedInUser =req.user;

    const {groupId} = req.body;

    const existedGroup = await groupconversation.findOne({admin:loggedInUser?._id})

    if(!existedGroup){
        throw new ApiError(404,"You are not authorized to add participant in group!")
    }

    next();
})