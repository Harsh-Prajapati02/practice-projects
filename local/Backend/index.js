// index.js
const express = require('express');
const userRouter = require('./Routes/user.routes');

const app = express();
app.use(express.json()); // for parsing JSON bodies
app.use("/users", userRouter)

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});