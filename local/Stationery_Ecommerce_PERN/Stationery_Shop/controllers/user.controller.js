const { getPool } = require('../config/db');
const pool = getPool();

// Utility to handle unexpected errors
function handleServerError(res, err, message = "Internal server error", status = 500) {
    console.error(message, err);
    return res.status(status).json({ error: message });
}

// GET /users/me
async function getMe(req, res) {
    try {
        const user = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User data retrieved successfully",
            user: user.rows[0],
        });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// GET /users (Admin only)
async function getAllUsers(req, res) {
    try {
        const result = await pool.query("SELECT id, name, email, role FROM users");
        res.status(200).json({
            message: `Total ${result.rows.length} users retrieved successfully`,
            users: result.rows,
        });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// GET /users/:id (Admin only)
async function getUserById(req, res) {
    const userId = req.params.id;

    try {
        const user = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user: user.rows[0],
        });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// DELETE /users/:id (Admin only)
async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        // Optional: check if user exists before deleting
        const check = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return handleServerError(res, err);
    }
}

module.exports = {
    getMe,
    getAllUsers,
    getUserById,
    deleteUser,
};