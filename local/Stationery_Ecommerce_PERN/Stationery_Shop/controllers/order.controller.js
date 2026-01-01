const { getPool } = require('../config/db');
const pool = getPool();

const handleServerError = (res, err, message = "Internal server error", status = 500) => {
    console.error(message, err);
    res.status(status).json({ error: message });
};

// POST /orders - Place an order
async function placeOrder(req, res) {
    const userId = req.user.id;

    try {
        // Get user's cart
        const cartItems = await pool.query(`
      SELECT ci.product_id, ci.quantity, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1`, [userId]);

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Check stock
        for (const item of cartItems.rows) {
            if (item.quantity > item.stock) {
                return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
            }
        }

        // Calculate total
        const totalPrice = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Create order
        const orderResult = await pool.query(`
      INSERT INTO orders (user_id, total_price)
      VALUES ($1, $2)
      RETURNING *`, [userId, totalPrice]);

        const orderId = orderResult.rows[0].id;

        // Insert order_items
        const insertPromises = cartItems.rows.map(item => {
            return pool.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price]);
        });

        await Promise.all(insertPromises);

        // Decrease product stock
        const stockUpdatePromises = cartItems.rows.map(item => {
            return pool.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        });
        await Promise.all(stockUpdatePromises);

        // Clear cart
        await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

        res.status(201).json({ message: "Order placed successfully", order: orderResult.rows[0] });
    } catch (err) {
        handleServerError(res, err);
    }
}

// GET /orders/my - Get user's own orders
async function getMyOrders(req, res) {
    const userId = req.user.id;

    try {
        const result = await pool.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        res.json(result.rows);
    } catch (err) {
        handleServerError(res, err);
    }
}

// GET /orders/:id - Get single order
async function getOrderById(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderResult.rows[0];

        // Only owner or admin can view
        if (order.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const itemsResult = await pool.query(`
      SELECT oi.*, p.title, p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`, [orderId]);

        res.json({ order, items: itemsResult.rows });
    } catch (err) {
        handleServerError(res, err);
    }
}

// GET /orders - Admin: all orders
async function getAllOrders(_req, res) {
    try {
        const result = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
        res.json(result.rows);
    } catch (err) {
        handleServerError(res, err);
    }
}

// PUT /orders/:id/status - Admin updates order status
async function updateOrderStatus(req, res) {
    const orderId = req.params.id;
    const rawStatus = req.body.status;

    if (!rawStatus) {
        return res.status(400).json({ error: "Status is required" });
    }

    const status = rawStatus.trim().toLowerCase();

    const allowedStatuses = ['pending', 'in-transit', 'delivered', 'cancelled', 'returned'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        // Fetch current order
        const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const currentStatus = orderResult.rows[0].status;

        // Prevent changing from final states
        if (['cancelled', 'returned'].includes(currentStatus)) {
            return res.status(400).json({ error: `Cannot update a ${currentStatus} order` });
        }

        // Update status
        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, orderId]
        );

        res.json({
            message: `Order status updated from '${currentStatus}' to '${status}'`,
            order: result.rows[0]
        });
    } catch (err) {
        handleServerError(res, err);
    }
}


// DELETE /orders/:id - Cancel (if pending)
async function cancelOrder(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
        const order = result.rows[0];

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: "Only pending orders can be cancelled" });
        }

        await pool.query(`UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [orderId]);
        res.json({ message: "Order cancelled successfully" });
    } catch (err) {
        handleServerError(res, err);
    }
}

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
};