// const client = require('../db')

// // GET Controller
// const getController = (req, res) => {
//     client.query('SELECT * FROM users', (err, result) => {
//         if (err) {
//             console.error('Query error:', err.stack);   
//             res.status(500).send('Server Error');
//         } else {
//             console.log(result);
//             res.json(result.rows);
//         }
//     });
// };

// // POST Controller
// const postController = (req, res) => {
//     const { name, email } = req.body;

//     client.query(
//         'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
//         [name, email],
//         (err, result) => {
//             if (err) {
//                 console.error('Insert error:', err.stack);
//                 res.status(500).send('Server Error');
//             } else {
//                 console.log(result);
//                 res.status(201).json(result.rows[0]);
//             }
//         }
//     );
// };

// // PUT Controller
// const putController = (req, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;

//     client.query(
//         'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
//         [name, email, id],
//         (err, result) => {
//             if (err) {
//                 console.error('Update error:', err.stack);
//                 res.status(500).send('Server Error');
//             } else if (result.rows.length === 0) {
//                 res.status(404).send('User not found');
//             } else {
//                 res.json(result.rows[0]);
//             }
//         }
//     );
// };

// // DELETE Controller
// const deleteController = (req, res) => {
//     const { id } = req.params;

//     client.query(
//         'DELETE FROM users WHERE id = $1 RETURNING *',
//         [id],
//         (err, result) => {
//             if (err) {
//                 console.error('Delete error:', err.stack);
//                 res.status(500).send('Server Error');
//             } else if (result.rows.length === 0) {
//                 res.status(404).send('User not found');
//             } else {
//                 res.json({ message: 'User deleted successfully', user: result.rows[0] });
//             }
//         }
//     );
// };

// module.exports = {getController, postController, putController, deleteController};

// ========================================================================================= // 

const userModel = require('../Models/user.model');

// GET Controller
const getController = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Query error:', err.stack);
        res.status(500).send('Server Error');
    }
};

// POST Controller
const postController = async (req, res) => {
    const { name, email } = req.body;
    try {
        const newUser = await userModel.createUser(name, email);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Insert error:', err.stack);
        res.status(500).send('Server Error');
    }
};

// PUT Controller
const putController = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const updatedUser = await userModel.updateUser(id, name, email);
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.json(updatedUser);
    } catch (err) {
        console.error('Update error:', err.stack);
        res.status(500).send('Server Error');
    }
};

// DELETE Controller
const deleteController = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await userModel.deleteUser(id);
        if (!deletedUser) {
            return res.status(404).send('User not found');
        }
        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (err) {
        console.error('Delete error:', err.stack);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getController,
    postController,
    putController,
    deleteController,
};  