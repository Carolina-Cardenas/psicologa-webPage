import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
