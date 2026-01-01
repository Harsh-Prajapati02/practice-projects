const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/user.routes');
const productRouter = require('./routes/product.routes');
dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', userRouter);
app.use('/products', productRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));