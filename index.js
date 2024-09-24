const dotenv = require("dotenv");
const express = require("express");
const {Server} = require("socket.io");
const {init} = require('./socket');
const {createServer} = require('http');
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
const server = createServer(app);
const io = init(server)

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

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    // socket.emit("quiz_updated", {data: "Fetch the quizzes data again"})
    socket.broadcast.emit("quiz_updated", {data: "fetch the quizzes data again"})
    socket.on("quiz_updated", (arg) => {
        console.log(arg);
    });
});

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


server.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
