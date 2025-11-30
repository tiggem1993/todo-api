import {
  getAllTodosService,
  getTodoByIdService,
  addTodoService,
  updateTodoByIdService,
  deleteTodoByIdService,
} from "../services/todo.service.js";

import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getAllTodos = asyncHandler(async (req, res) => {
  const todos = await getAllTodosService();
  res.status(200).json(todos);
});

export const getTodoById = asyncHandler(async (req, res) => {
  const todo = await getTodoByIdService(req.params.id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json(todo);
});

export const addTodo = asyncHandler(async (req, res) => {
  const todo = await addTodoService(req.body);
  res.status(201).json(todo);
});

export const updateTodoById = asyncHandler(async (req, res) => {
  const todo = await updateTodoByIdService(req.params.id, req.body);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json(todo);
});

export const deleteTodoById = asyncHandler(async (req, res) => {
  const todo = await deleteTodoByIdService(req.params.id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json({ message: "Todo deleted successfully" });
});
