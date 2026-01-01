const client = require('../config/db');

// Get all todos
const getAllTodos = async () => {
  try {
    const res = await client.query('SELECT * FROM todos ORDER BY id');
    return res.rows;
  } catch (error) {
    throw new Error('Error fetching todos: ' + error.message);
  }
};

// Get a todo by ID
const getTodoById = async (id) => {
  try {
    const res = await client.query('SELECT * FROM todos WHERE id = $1', [id]);
    return res.rows[0];
  } catch (error) {
    throw new Error('Error fetching todo: ' + error.message);
  }
};

// Create a new todo
const createTodo = async (title) => {
  try {
    const res = await client.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    return res.rows[0];
  } catch (error) {
    throw new Error('Error creating todo: ' + error.message);
  }
};

// Update an existing todo
const updateTodo = async (id, title, completed) => {
  try {
    const res = await client.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    return res.rows[0];
  } catch (error) {
    throw new Error('Error updating todo: ' + error.message);
  }
};

// Delete a todo by ID
const deleteTodo = async (id) => {
  try {
    const res = await client.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0]; // return deleted todo (for confirmation)
  } catch (error) {
    throw new Error('Error deleting todo: ' + error.message);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};