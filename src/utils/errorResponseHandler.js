// middleware/error.middleware.ts
export const errorHandler = (res,statusCode,success,message) => {
  res.status(statusCode).json({success:success,message:message})
};
