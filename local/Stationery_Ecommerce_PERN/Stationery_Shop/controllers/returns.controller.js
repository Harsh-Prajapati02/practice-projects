const { getPool } = require('../config/db');
const pool = getPool();

const handleServerError = (res, err, message = "Internal server error", status = 500) => {
    console.error(message, err);
    res.status(status).json({ error: message });
};

const allowedReturnStatuses = ['approved', 'rejected', 'processed'];

// ===============================
// POST /returns - User requests a return
// ===============================
async function requestReturn(req, res) {
    const userId = req.user.id;
    const { order_id, reason } = req.body;

    if (!order_id || !reason) {
        return res.status(400).json({ error: "Order ID and reason are required." });
    }

    try {
        // 1. Verify the order exists and belongs to the user
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',

        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found." });
        }

        const order = orderResult.rows[0];

        // 2. Only allow return if status is 'delivered'
        if (order.status !== 'delivered') {
            return res.status(400).json({ error: "Only delivered orders can be returned." });
        }

        // 3. Check if a return request already exists
        const existingReturn = await pool.query(
            'SELECT * FROM returns WHERE order_id = $1',
            [order_id]
        );
        if (existingReturn.rows.length > 0) {
            return res.status(400).json({ error: "Return request already submitted." });
        }

        // 4. Create new return request
        const result = await pool.query(
            `INSERT INTO returns (order_id, user_id, reason)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [order_id, userId, reason]
        );

        res.status(201).json({
            message: "Return request submitted successfully.",
            return: result.rows[0],
        });
    } catch (err) {
        handleServerError(res, err, "Failed to submit return request.");
    }
}

// ===============================
// GET /returns/my - User's return requests
// ===============================
async function getMyReturns(req, res) {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT * FROM returns WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        handleServerError(res, err, "Failed to fetch your return requests.");
    }
}

// ===============================
// GET /returns - Admin: all return requests
// ===============================
async function getAllReturns(_req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM returns ORDER BY created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        handleServerError(res, err, "Failed to fetch all return requests.");
    } [order_id, userId]
}

// ===============================
// PUT /returns/:id - Admin: update return status
// ===============================
async function updateReturnStatus(req, res) {
    const returnId = req.params.id;
    const { status } = req.body;

    if (!allowedReturnStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid return status." });
    }

    try {
        // Update return record
        const result = await pool.query(
            `UPDATE returns
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, returnId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Return request not found." });
        }

        const returnData = result.rows[0];

        // ✅ Only update order status if return is fully processed
        if (status === 'processed') {
            await pool.query(
                `UPDATE orders
                 SET status = 'returned', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [returnData.order_id]
            );
        }

        res.status(200).json({
            message: `Return status updated to '${status}'.`,
            return: returnData,
        });
    } catch (err) {
        handleServerError(res, err, "Failed to update return status.");
    }
}

module.exports = {
    requestReturn,
    getMyReturns,
    getAllReturns,
    updateReturnStatus,
};