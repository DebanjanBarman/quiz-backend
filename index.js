const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const quizRouter = require("./routes/quizRoutes");
const questionRouter = require("./routes/questionRoutes");
const optionsRouter = require("./routes/optionsRoutes");
const answersRouter = require("./routes/answersRouter");
const responsesRouter = require("./routes/responsesRouter");
const adminRouter = require("./routes/adminRoutes");
const resultRouter = require("./routes/resultRoutes")
const gameLogicRouter = require("./routes/gameLogicRoutes")
const initDB = require("./DB/initDB");

const app = express();
dotenv.config({path: "./config.env"});
const PORT = process.env.PORT;

app.use(express.json({limit: "100kb"}));
app.use(cors({origin: "*", exposedHeaders: "Content-Range"}));

app.options("/", cors());

app.use("/api/users", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/question", questionRouter);
app.use("/api/options", optionsRouter);
app.use("/api/answer", answersRouter);
app.use("/api/response", responsesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/result", resultRouter);
app.use("/api/game", gameLogicRouter);


app.get("/", (req, res) => {
    res.send("working");
});

(async () => {
    const db = await initDB.initializeDB();
    if (db) {
        console.log("DB connected successfully");
    } else {
        console.log(db);
    }
})();


app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
