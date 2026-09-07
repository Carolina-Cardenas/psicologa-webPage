import "./config/env";

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el servidor:", error);

    process.exit(1);
  }
};

void startServer();
