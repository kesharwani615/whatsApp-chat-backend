import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use public DNS servers (Google and Cloudflare) to resolve the MongoDB SRV record
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const database = async () => {
  await mongoose.connect(process.env.DB).then((res) => {
    console.log("database is connected successfully!")
  }).catch((err) => {
    console.log(err)
    console.log("database is not connected!")
  })
}
