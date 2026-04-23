import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar MongoDB:", error);
    process.exit(1);
  }
};
