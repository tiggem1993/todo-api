// define sample routes for todo items
import express from "express";
import {
  getAllTodos,
  getTodoById,
  addTodo,
  updateTodoById,
  deleteTodoById,
} from "../controllers/todo.controller.js";

const router = express.Router();

router.get("/", getAllTodos);
router.get("/:id", getTodoById);
router.post("/", addTodo);
router.put("/:id", updateTodoById);
router.delete("/:id", deleteTodoById);

export default router;
