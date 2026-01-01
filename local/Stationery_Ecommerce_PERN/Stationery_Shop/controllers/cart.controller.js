const { getPool } = require('../config/db');
const pool = getPool();

const handleServerError = (res, err, message = "Internal server error", status = 500) => {
    console.error(message, err);
    return res.status(status).json({ error: message });
};

// GET /cart
async function getCart(req, res) {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT ci.id as cart_item_id, ci.quantity, p.*
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = $1`,
            [userId]
        );

        const totalPrice = result.rows.reduce((total, item) => total + (item.price * item.quantity), 0);

        return res.status(200).json({
            message: `Cart fetched successfully. Total ${result.rows.length} item(s).`,
            items: result.rows,
            totalPrice,
        });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// POST /cart
async function addToCart(req, res) {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Validate inputs
    const qty = parseInt(quantity, 10);
    if (!product_id || !qty || qty < 1) {
        return res.status(400).json({ error: "product_id and a valid integer quantity (>=1) are required" });
    }

    try {
        const productCheck = await pool.query('SELECT stock FROM products WHERE id = $1', [product_id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const availableStock = productCheck.rows[0].stock;
        if (qty > availableStock) {
            return res.status(400).json({ error: `Only ${availableStock} items available in stock` });
        }

        const cartCheck = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
            [userId, product_id]
        );

        if (cartCheck.rows.length > 0) {
            const currentQuantity = cartCheck.rows[0].quantity;
            const newQuantity = currentQuantity + qty;

            if (newQuantity > availableStock) {
                return res.status(400).json({
                    error: `Cannot add ${qty} items. Only ${availableStock - currentQuantity} more available.`,
                });
            }

            const updateResult = await pool.query(
                `UPDATE cart_items
                 SET quantity = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [newQuantity, cartCheck.rows[0].id]
            );

            return res.status(200).json({
                message: "Cart item quantity updated successfully",
                item: updateResult.rows[0],
            });
        } else {
            const insertResult = await pool.query(
                `INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [userId, product_id, qty]
            );

            return res.status(201).json({
                message: "Item added to cart successfully",
                item: insertResult.rows[0],
            });
        }
    } catch (err) {
        return handleServerError(res, err);
    }
}

// PUT /cart/:itemId
async function updateCartItem(req, res) {
    const userId = req.user.id;
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
        return res.status(400).json({ error: "Valid quantity (integer >=1) is required" });
    }

    try {
        const cartCheck = await pool.query(
            `SELECT ci.*, p.stock FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.id = $1 AND ci.user_id = $2`,
            [itemId, userId]
        );

        if (cartCheck.rows.length === 0) {
            return res.status(404).json({ error: "Cart item not found" });
        }

        const { stock } = cartCheck.rows[0];
        if (qty > stock) {
            return res.status(400).json({ error: `Only ${stock} items available in stock` });
        }

        const updateResult = await pool.query(
            `UPDATE cart_items
             SET quantity = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [qty, itemId]
        );

        return res.status(200).json({
            message: "Cart item updated successfully",
            item: updateResult.rows[0],
        });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// DELETE /cart/:itemId
async function removeCartItem(req, res) {
    const userId = req.user.id;
    const itemId = req.params.itemId;

    try {
        const cartCheck = await pool.query('SELECT * FROM cart_items WHERE id = $1 AND user_id = $2', [itemId, userId]);
        if (cartCheck.rows.length === 0) {
            return res.status(404).json({ error: "Cart item not found" });
        }

        await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
        return res.status(200).json({ message: "Cart item removed successfully" });
    } catch (err) {
        return handleServerError(res, err);
    }
}

// DELETE /cart/clear
async function clearCart(req, res) {
    const userId = req.user.id;

    try {
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
        return res.status(200).json({ message: "Cart cleared successfully" });
    } catch (err) {
        return handleServerError(res, err);
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};