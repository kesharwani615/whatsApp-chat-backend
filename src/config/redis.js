// config/redis.js
import Redis from "ioredis";

const redis = new Redis({
    host: "127.0.0.1", // docker mapped port
    port: 6379,
});

redis.on("connect", () => {
    console.log("✅ Redis connected");
});

export default redis; 