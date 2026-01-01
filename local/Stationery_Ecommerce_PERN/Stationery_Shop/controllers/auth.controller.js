const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getPool } = require('../config/db');
const pool = getPool();
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/generateTokens");

function handleServerError(res, err, message = "Internal server error", status = 500) {
    console.error(message, err);
    return res.status(status).json({ error: message });
}

// async function register(req, res) {
//     const { name, email, password } = req.body;
//     const hashed = await bcrypt.hash(password, 10);

//     try {
//         const result = await pool.query(
//             "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role",
//             [name, email, hashed]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         if (err.code === "23505") {
//             res.status(400).json({ error: "Email already exists" });
//         } else {
//             console.error("Register Error:", err);
//             res.status(500).json({ error: "Registration failed" });
//         }
//     }
// }

async function register(req, res) {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already registered with this email" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role",
            [name, email, hashed]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0],
        });
    } catch (err) {
        console.error("Register Error:", err);
        return handleServerError(res);
    }
}

// LOGIN USER
// async function login(req, res) {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ error: "Email and password are required" });
//     }

//     try {
//         const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//         const user = userQuery.rows[0];

//         if (!user) {
//             return res.status(401).json({ error: "Invalid credentials" });
//         }

//         const match = await bcrypt.compare(password, user.password_hash);
//         if (!match) {
//             return res.status(401).json({ error: "Invalid credentials" });
//         }

//         const userPayload = { id: user.id, role: user.role };
//         const accessToken = generateAccessToken(userPayload);
//         const refreshToken = generateRefreshToken(userPayload);

//         // Set refresh token in HTTPOnly cookie
//         res.cookie("refreshToken", refreshToken, {
//             httpOnly: true,
//             secure: true, // use only over HTTPS in production
//             sameSite: "Lax", // or 'Lax' if needed
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         // Send access token only
//         res.status(200).json({ accessToken });
//     } catch (err) {
//         console.error("Login Error:", err);
//         return handleServerError(res);
//     }
// }

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already logged in via refresh token
    const token = req.cookies.refreshToken;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            if (decoded && decoded.id) {
                return res.status(400).json({ error: "User already logged in" });
            }
        } catch (err) {
            // Token is invalid or expired — ignore and allow user to log in
            // console.warn("Invalid or expired refresh token at login:", e.message);
        }
    }

    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const userPayload = { id: user.id, role: user.role };
        const accessToken = generateAccessToken(userPayload);
        const refreshToken = generateRefreshToken(userPayload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "Login successful",
            accessToken,
        });
    } catch (err) {
        console.error("Login Error:", err);
        return handleServerError(res);
    }
}

// async function refresh(req, res) {
//     // const token = req.cookies.refreshToken;
//     const token = req.cookies.refreshToken;

//     if (!token) {
//         return res.status(401).json({ error: "Refresh token is required" });
//     }

//     try {
//         jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
//             if (err) {
//                 console.error("Refresh Token Error:", err);
//                 return res.status(403).json({ error: "Invalid or expired refresh token" });
//             }

//             const accessToken = generateAccessToken({ id: user.id, role: user.role });
//             return res.json({ accessToken });
//         });
//     } catch (err) {
//         console.error("Refresh Error:", err);
//         return handleServerError(res);
//     }
// }

async function refresh(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ error: "Refresh token is required" });
    }

    try {
        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                console.error("Refresh Token Error:", err);
                return res.status(403).json({ error: "Invalid or expired refresh token" });
            }

            const accessToken = generateAccessToken({ id: user.id, role: user.role });
            return res.json({
                message: "Access token refreshed successfully",
                accessToken,
            });
        });
    } catch (err) {
        console.error("Refresh Error:", err);
        return handleServerError(res);
    }
}

// async function logout(_req, res) {
//     res.clearCookie("refreshToken", {
//         httpOnly: true,
//         secure: true,
//         sameSite: "Strict",
//     });

//     res.status(200).json({ message: "Successfully logged out" });
// }

async function logout(_req, res) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
}

module.exports = {
    register,
    login,
    refresh,
    logout,
};