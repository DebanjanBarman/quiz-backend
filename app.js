const express = require('express');
const app = express();

const userRouter = require("./routes/userRoutes");


app.use("/api/users", userRouter);

app.get("/", (req, res) => {
    res.send("working");
});


exports.app = app;