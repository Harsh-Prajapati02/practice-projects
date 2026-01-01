const todoModel = require("../models/todo.model");

// GET all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await todoModel.getAllTodos();

    if (!todos || todos.length === 0) {
      return res.status(404).json({ message: 'No todos found' });
    }

    res.status(200).json({
      message: 'Todos retrieved successfully',
      data: todos,
    });
  } catch (error) {
    console.error('Error fetching todos:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET todo by ID
exports.getTodo = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid or missing ID' });
  }

  try {
    const todo = await todoModel.getTodoById(id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({
      message: 'Todo retrieved successfully',
      data: todo,
    });
  } catch (error) {
    console.error('Error fetching todo by ID:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE new todo
exports.createTodo = async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newTodo = await todoModel.createTodo(title);

    res.status(201).json({
      message: 'Todo created successfully',
      data: newTodo,
    });
  } catch (error) {
    console.error('Error creating todo:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE existing todo
exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (!title || typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'Both title and completed (true/false) are required',
    });
  }

  try {
    const updated = await todoModel.updateTodo(id, title, completed);

    if (!updated) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({
      message: 'Todo updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating todo:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE todo
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const deleted = await todoModel.deleteTodo(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({
      message: 'Todo deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting todo:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};