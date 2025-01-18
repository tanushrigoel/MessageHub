import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectdb(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully");
  } catch (err) {
    console.log("DB connection failed ");

    process.exit(1);
  }
}

export default connectdb;
