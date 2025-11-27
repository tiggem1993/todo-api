import ToDo from "../models/todo.model.js";
export const getAllTodos = async (req, res) => {
  try {
    const todos = await ToDo.find({});
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodoById = async (req, res) => {
  try {
    const todo = await ToDo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addTodo = async (req, res) => {
  try {
    const todo = await ToDo.create(req.body);
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTodoById = async (req, res) => {
  try {
    const todo = await ToDo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTodoById = async (req, res) => {
  try {
    const todo = await ToDo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    res.status(200).json({ message: "Todo item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
