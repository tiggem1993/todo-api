import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/todos", todoRoutes);

// Global error middleware
app.use(errorMiddleware);

export default app;
