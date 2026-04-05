import mongoose from "mongoose";

export const database=async()=>{
    await mongoose.connect(process.env.DB).then((res)=>{
      console.log("database is connected successfully!")
    }).catch((err)=>{
        console.log("database is not connected!")
    })
}
