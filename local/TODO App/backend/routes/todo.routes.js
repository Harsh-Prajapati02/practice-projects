const express = require('express');
const { getTodos, deleteTodo, updateTodo, createTodo, getTodo } = require('../controllers/todo.controller');
const router = express.Router();

router.get('/', getTodos);
router.get('/:id', getTodo);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;