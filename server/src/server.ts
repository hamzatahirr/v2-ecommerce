import { addAlias } from "module-alias";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from the correct location
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Configure module aliases
const isProduction = process.env.NODE_ENV === "production";
const projectRoot = path.resolve(__dirname, "..");
const aliasPath = path.join(projectRoot, isProduction ? "dist" : "src");

addAlias("@", aliasPath);

// Import after setting up alias
import { createApp } from "./app";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log("Starting server...");
    const { httpServer } = await createApp();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();