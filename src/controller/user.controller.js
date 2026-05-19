import mongoose from "mongoose";
import user from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from 'cloudinary'
import { errorHandler } from "../utils/errorResponseHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, username, email, password, mobile } = req.body;

  if (
    [name, username, email, password, mobile]?.some(
      (item) => item.trim() === ""
    )
  ) {
    errorHandler(res, 400, false, "Please enter all fields");
  }

  const existedAccount = await user.findOne({ email: email });

  if (existedAccount) {
    return errorHandler(res, 400, false, "user already exist!")
  }

  const newUser = new user({
    name: name,
    username: username,
    email: email,
    password: password,
    mobileNumber: mobile,
  });

  const saveUser = await newUser.save();
  console.log(saveUser);

  return res.status(201).json(
    new ApiResponse(201, saveUser, "user created successfully")
  );
  // res.status(201).json({success:true, msg: "user created successfully",user:saveUser});
});

const generateToken = async (userId) => {
  try {
    const existedUser = await user.findOne(userId).select("-password");

    const accessToken = await existedUser.generateAccessToken();
    const refreshToken = await existedUser.generateRefreshToken();

    existedUser.refreshToken = refreshToken;

    await existedUser.save({ validateBeforeSave: false });

    return ({ accessToken, refreshToken, existedUser });

  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access or refresh tokens",
      error
    );
  }
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if ([email, password]?.some((item) => item.trim() === "")) {
    throw new ApiError(400, "Please enter all fields");
  }

  const getUser = await user.findOne({ email: email });

  if (!getUser) {
    throw new ApiError(404, "User doest not exist!");
  }

  const PasswordCorrect = await getUser.isPasswordCorrect(password);

  if (!PasswordCorrect) {
    throw new ApiError(400, false, "User credential are worng!");
  }

  const { accessToken, refreshToken, existedUser } = await generateToken(getUser._id);

  const isProduction = process.env.NODE_ENV === "production";

  const option = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  };

  return res
    .status(200)
    .cookie("whatsApp", accessToken, option)
    .json(
      new ApiResponse(200, {
        user: existedUser,
        accessToken,
        refreshToken,
      }, "user logged in successfully")
    );
});

export const uploadImage = asyncHandler(async (req, res) => {

  const file = req.files[0]?.path

  console.log(file);
  const uploadedOnCloud = await cloudinary.uploader.upload(file);

  if (!uploadedOnCloud) {
    throw new ApiError("500", "something went worng while uploading image on bucket!")
  }

  return uploadedOnCloud?.url;
});

export const editProfile = asyncHandler(async (req, res) => {
  const { username, mobileNumber, name } = req.body;

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, "Please provide valid user id");
  }

  const existedUser = await user.findById(id);

  if (!existedUser) {
    throw new ApiError(404, "User Not Found");
  }

  existedUser.name = name || existedUser.name;
  existedUser.username = username || existedUser.username
  existedUser.mobileNumber = mobileNumber || existedUser.mobileNumber

  const updatedUser = await existedUser.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
})

export const logout = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existedUser = await user.findById(id);

  if (!existedUser) {
    throw new ApiError(404, "User Not Found");
  }

  existedUser.refreshToken = "";

  const updatedUser = await existedUser.save({ validateBeforeSave: false });

  const isProduction = process.env.NODE_ENV === "production";

  const option = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  };

  res.status(200)
    .clearCookie("whatsApp", option)
    .json(new ApiResponse(200, updatedUser, "user logged out successfully"));
});
