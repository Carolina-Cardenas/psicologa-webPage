import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(` Falta la variable de entorno requerida: ${key}`);
  }
}
