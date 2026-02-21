import mongoose from "mongoose";


let isConnected = false; // global flag

export async function dbConnect() {
  if (isConnected) {
    console.log("🔄 Already connected to MongoDB");
    return;
  }
  console.log("MongoDB URI:", process.env.MONGODB_URI); // Debugging log
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);


    isConnected = db.connections[0].readyState === 1; // mark as connected
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}
