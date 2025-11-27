// define sample routes for todo items
import express from "express";
import ToDo from "../models/todo.model.js";
import {
  getAllTodos,
  getTodoById,
  addTodo,
  updateTodoById,
  deleteTodoById,
} from "../controllers/todo.controller.js";

const router = express.Router();

// Get default route
router.get("/", (req, res) => {
  res.send("Todo app is working tree");
});

router.get("/todo", getAllTodos);

router.get("/todo/:id", getTodoById);

router.post("/add", addTodo);

//write a put route to update a todo item by ID
router.put("/todo/:id", updateTodoById);

//write a delete route to delete a todo item by ID
router.delete("/todo/:id", deleteTodoById);

export default router;
