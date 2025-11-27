//write a sample code for a basic express server including cors and body-parser middlewares in server.js
import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Middlewares
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

/* app.get("/", (req, res) => {
res.send("Hello, World!");
}); */
app.use("/api", todoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
