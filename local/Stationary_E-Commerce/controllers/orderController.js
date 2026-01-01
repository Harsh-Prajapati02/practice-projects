const pool = require('../config/db');
const { updateStockStatus } = require('./productController');
const { VALID_ORDER_STATUSES } = require('../constants');

exports.placeOrder = async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    try {
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);

        if (!product.rows.length || product.rows[0].stock < quantity) {
            return res.status(400).json({ error: 'Out of stock' });
        }

        const order = await pool.query(
            'INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [user_id, product_id, quantity]
        );

        await updateStockStatus(product_id, -quantity);
        res.status(201).json(order.rows[0]);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllOrders = async (_, res) => {
    try {
        const result = await pool.query(`
        SELECT
            o.id AS order_id,
            o.user_id,
            o.quantity,
            o.status,
            o.order_date,
            o.delivery_date,
            o.return_date,
            p.name AS product_name,
            p.price AS product_price
        FROM orders o
        JOIN products p ON o.product_id = p.id
        ORDER BY o.id DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    // const validStatuses = ['in-transit', 'canceled', 'returned', 'delivered'];
    if (!VALID_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (!order.rows.length) {
            return res.status(404).json({ error: 'Order not found' });
        }

        let dateField = null;
        if (status === 'delivered') {
            dateField = 'delivery_date';
        } else if (status === 'returned') {
            dateField = 'return_date';
        }

        if (dateField) {
            await pool.query(
                `UPDATE orders SET status = $1, ${dateField} = CURRENT_TIMESTAMP WHERE id = $2`,
                [status, req.params.id]
            );
        } else {
            await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
        }

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
};

exports.returnOrder = async (req, res) => {
    try {
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (order.rows[0].status !== 'delivered') {
            return res.status(400).json({ error: 'Only delivered orders can be returned' });
        }

        await pool.query(
            'UPDATE orders SET status = $1, return_date = CURRENT_TIMESTAMP WHERE id = $2',
            ['returned', req.params.id]
        );

        await updateStockStatus(order.rows[0].product_id, order.rows[0].quantity);
        res.json({ message: 'Order returned' });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (order.rows[0].status !== 'in-transit') {
            return res.status(400).json({ error: 'Only in-transit orders can be canceled' });
        }

        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['canceled', req.params.id]);

        await updateStockStatus(order.rows[0].product_id, order.rows[0].quantity);
        res.json({ message: 'Order canceled' });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
};