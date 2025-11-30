import ToDo from "../models/todo.model.js";
import mongoose from "mongoose";

export const getAllTodosService = () => {
  return ToDo.find({}).lean();
};

export const getTodoByIdService = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid ID format");
  }

  return ToDo.findById(id).lean();
};

export const addTodoService = (data) => {
  return ToDo.create(data);
};

export const updateTodoByIdService = (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid ID format");
  }

  return ToDo.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteTodoByIdService = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid ID format");
  }

  return ToDo.findByIdAndDelete(id);
};
