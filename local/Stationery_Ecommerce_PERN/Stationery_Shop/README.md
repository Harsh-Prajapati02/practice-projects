# Build a Full-Stack Stationery E-commerce Website (PERN Stack)

## `Goal`
Develop a fully functional Stationery E-commerce platform using the PERN stack with user authentication, role-based access, and robust product, cart, and order management, including returns.

---

## `Technical Requirements`

### 1. `Authentication and Authorization`
- Implement user authentication (Sign-Up, Login) using JWT:
  - Access Token (short-lived)
  - Refresh Token (long-lived)
- Store refresh token securely (e.g., HTTPOnly cookie or secure local storage).
- Middleware to protect routes and verify roles.
- Two roles:
  - **Admin** – Full access to product/order management.
  - **User** – Can view, purchase, and return products.

### 2. `Role-Based Access Control`
- Only Admins can:
  - Add, update, or delete products.
  - View all orders.
  - Update order status.
- Users can:
  - View products
  - Add to cart
  - Place orders
  - View own orders
  - Request returns

### 3. `Product Management`
- Admin panel with full CRED operations:
  - Create, Read, Edit, Delete products
- Manage stock status:
  - Product Schema:
    - in-stock
    - sold
    - out-of-stock
```json
{
  "title": "Notebook",
  "description": "120 pages, A4 size",
  "price": 100,
  "stock": 20,
  "status": "in-stock"
}
```
### 4. `Product Detail Page`

Single product page with:
- Image
- Title
- Price
- Description
- "Add to Cart" button
- Stock availability

---

### 5. `Cart Page`

Authenticated users can:
- Add products to cart
- Increase/decrease quantity
- Remove items
- View total price
- Proceed to checkout

### 6. `Order Management`

- Users can place orders from cart.
- Store order details including:
  - Product info
  - Quantity
  - Total price
  - Order status:
    - pending
    - in-transit
    - delivered
    - cancelled
    - returned

- Admins can:
  - View all orders
  - Change order status

- Users can:
  - View their orders
  - Track order status

---

### 7. `Return Management`

- Users can request return if order is marked **delivered**

- Admin can:
  - Approve or reject return
  - Update order status to **returned** if approved
  - Track return lifecycle in the order model
---

# Tech Stack

## `Frontend (React)`
- React + React Router
- Redux or Context API for state management
- Axios for API requests
- JWT token handling (Access & Refresh tokens)
- Role-based route protection
- Admin Dashboard including:
  - Product List
  - Product Detail
  - Cart
  - Orders

## `Backend (Node.js + Express)`
- Express REST API
- JWT-based Authentication
- Middleware for authentication & role authorization
- Routes:
  - `/auth/register`
  - `/auth/login`
  - `/auth/refresh`
  - `/auth/logout`
  - `/products` (GET, POST, PUT, DELETE)
  - `/cart` (user-specific)
  - `/orders` (user/admin)
  - `/returns`

## `Database (PostgreSQL)`

### `Tables:`
- `users`  
  Columns: `id`, `name`, `email`, `passwordHash`, `role`

- `products`  
  Columns: `id`, `title`, `description`, `price`, `stock`, `status`

- `cart_items`  
  Columns: `user_id`, `product_id`, `quantity`

- `orders`  
  Columns: `id`, `user_id`, `total`, `status`, `created_at`

- `order_items`  
  Columns: `order_id`, `product_id`, `quantity`, `price`

- `returns`  
  Columns: `id`, `order_id`, `user_id`, `reason`, `status`

---

## `Optional Enhancements`
- File/image upload with cloud storage (Cloudinary/S3)
- Email notifications for orders/returns
- Pagination & filtering on products
- Responsive design for mobile
- Analytics dashboard for admin
---
---
# Backend Folder Structure for PERN Stack Stationery E-commerce Website

Designed to support:
- Role-based access (admin, user)
- Authentication (JWT: access & refresh tokens)
- Product, Cart, Order, and Return Management
- PostgreSQL with query builder or ORM (Sequelize, Prisma, Knex, adaptable)

```
backend/
├── config/
│   ├── db.js                 # PostgreSQL DB connection
│   ├── jwt.js                # JWT secret keys & config
│   └── dotenv.js             # Load environment variables
│
├── controllers/
│   ├── auth.controller.js    # Register, Login, Logout, Refresh
│   ├── user.controller.js    # User data, profile, admin-user management
│   ├── product.controller.js # CRUD for products
│   ├── cart.controller.js    # Cart management
│   ├── order.controller.js   # Place, view, update orders
│   ├── return.controller.js  # Return request and status management
│
├── middleware/
│   ├── auth.middleware.js    # JWT token verification middleware
│   ├── role.middleware.js    # Role-based access control
│   ├── validate.middleware.js # Input validation (if needed)
│
├── models/
│   ├── index.js              # Initialize all models
│   ├── user.model.js
│   ├── product.model.js
│   ├── cart.model.js
│   ├── order.model.js
│   ├── orderItem.model.js
│   ├── return.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── return.routes.js
│   └── index.js              # Combine all routes
│
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── product.service.js
│   ├── cart.service.js
│   ├── order.service.js
│   ├── return.service.js
│
├── utils/
│   ├── token.utils.js        # Create, verify JWT tokens
│   ├── password.utils.js     # Hash and compare passwords
│   ├── response.utils.js     # Format standard API responses
│
├── validations/
│   ├── auth.validation.js
│   ├── product.validation.js
│   ├── cart.validation.js
│   ├── order.validation.js
│   ├── return.validation.js
│
├── .env                      # Environment variables
├── app.js                    # Express app configuration
├── server.js                 # Application entry point
└── package.json
```

# API Endpoint Structure

## `Base URL`
`/api`

---

## `Auth & User Management`

| Method | Endpoint            | Description                        | Access         |
|--------|---------------------|----------------------------------|----------------|
| POST   | /auth/register      | Register a new user               | Public         |
| POST   | /auth/login         | Login and receive access + refresh token | Public         |
| POST   | /auth/refresh       | Refresh short-lived access token | Public (with refresh token) |
| POST   | /auth/logout        | Invalidate refresh token (logout)| Authenticated  |
| GET    | /users/me           | Get current logged-in user's info| Authenticated  |
| GET    | /users              | Get all users                    | Admin          |
| GET    | /users/:id          | Get specific user details         | Admin          |
| DELETE | /users/:id          | Delete a user                    | Admin          |

---

## `Product Management`

| Method | Endpoint           | Description                     | Access         |
|--------|--------------------|---------------------------------|----------------|
| GET    | /products          | Get all products                | Public         |
| GET    | /products/:id      | Get product details by ID       | Public         |
| POST   | /products          | Create a new product            | Admin          |
| PUT    | /products/:id      | Update product details          | Admin          |
| DELETE | /products/:id      | Delete a product                | Admin          |

---

## `Cart Management`

| Method | Endpoint           | Description                     | Access         |
|--------|--------------------|---------------------------------|----------------|
| GET    | /cart              | Get current user's cart items   | Authenticated  |
| POST   | /cart              | Add an item to the cart         | Authenticated  |
| PUT    | /cart/:itemId      | Update cart item quantity       | Authenticated  |
| DELETE | /cart/:itemId      | Remove specific item from cart  | Authenticated  |
| DELETE | /cart/clear        | Clear entire cart               | Authenticated  |

---

## `Order Management`

| Method | Endpoint           | Description                     | Access         |
|--------|--------------------|---------------------------------|----------------|
| GET    | /orders            | Get all orders                  | Admin          |
| GET    | /orders/my         | Get logged-in user's own orders | Authenticated  |
| GET    | /orders/:id        | Get specific order              | Owner/Admin    |
| POST   | /orders            | Place a new order from cart    | Authenticated  |
| PUT    | /orders/:id/status | Update order status            | Admin          |
| DELETE | /orders/:id        | Cancel an order (if pending)   | Owner/Admin    |

---

## `Return Management`

| Method | Endpoint           | Description                     | Access         |
|--------|--------------------|---------------------------------|----------------|
| POST   | /returns           | Request a return                | Authenticated (Owner) |
| GET    | /returns           | Get all return requests         | Admin          |
| GET    | /returns/my        | Get return requests by current user | Authenticated  |
| PUT    | /returns/:id       | Approve or reject return request | Admin          |

---

## `Token Handling`

| Token Type   | Description                                          |
|--------------|------------------------------------------------------|
| Access Token | Short-lived token for protected endpoints            |
| Refresh Token| Long-lived token (HTTPOnly cookie / secure store) used to refresh access token |

---

## `Status Workflow`

### Order Status Lifecycle:
`pending → in-transit → delivered → cancelled → returned (after return approved)`

### Return Status Lifecycle:
`requested → approved → processed → rejected`

---

## `Optional Endpoints (Enhancements)`

| Method | Endpoint                     | Description            | Access     |
|--------|------------------------------|------------------------|------------|
| GET    | /products/search?q=pen        | Search products by keyword | Public  |
| GET    | /products/category/:category  | Filter products by category | Public  |
| POST   | /products/:id/review          | Add product review       | Authenticated |
| GET    | /admin/dashboard              | Admin dashboard: metrics & stats | Admin |