const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./Routes/user.routes');
dotenv.config();

const app = express();

app.use(express.json());
app.use('/users', userRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT ${process.env.PORT}.`);
});