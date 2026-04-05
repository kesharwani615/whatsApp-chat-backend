import user from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorResponseHandler.js";

export const ProtectMiddleware = async (req, res, next) => {
  // try {

  const token = req.headers.authorization?.replace("Bearer ", "");

  console.log("token11:",token);

  if (!token) {
    return errorHandler(res, 403, false, "Unauthorized - No Token Provided");
  }

  let decoded;
  try {
    // console.log("token:",token,"procees:",process.env.ACCESS_TOKEN_SECRET)
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.log("===", decoded);
    return errorHandler(res, 403, false, "Unauthorized - No Token Provided");
  }

  if (!decoded || !decoded._id) {
    return errorHandler(res, 401, false, "Unauthorized - Invalid Token Data");
  }

  const existeduser = await user.findById(decoded._id).select("-password");

  if (!existeduser) {
    throw new ApiError(404, "user not found!");
  }

  req.user = existeduser;
  next();
  // } catch (error) {
  // 	throw new  ApiError(500,"internal server error!");
  // }
};
