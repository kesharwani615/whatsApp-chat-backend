import user from "../models/user.modal.js";
import { ApiError } from "../utils/apiError.js";
import jwt from 'jsonwebtoken'

export const checkValidToken=async(token)=>{
	    
	  if (!token) {
		throw new ApiError(403,"Unauthorized - No Token Provided");
	  }
  
	  let decoded;
	  try {

		decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
    } catch (err) {
          console.log("===",decoded,err); 
		throw new ApiError(403,"Unauthorized - No Token Provided");
	  }

	  if (!decoded || !decoded._id) {
		return res.status(401).json({ error: "Unauthorized - Invalid Token Data" });
	  }
  
	  const existeduser = await user.findById(decoded._id).select("-password");

	  if (!existeduser) {
		throw new  ApiError(404,"user not found, token invalid!");
	  }

      return existeduser;
} 