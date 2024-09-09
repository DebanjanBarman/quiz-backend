const dotenv = require("dotenv")
const cors = require("cors")
const initDB = require("./DB/initDB");

dotenv.config({path: "config.env"});

const {app} = require("./app")
const express = require("express");

app.use(express.json({limit: "100kb"}));
app.use(cors({origin: "*", exposedHeaders: "Content-Range"}));

app.options("/", cors());

(async () => {
    const db = await initDB.initializeDB();
    if (db) {
        console.log("DB connected successfully");
    } else {
        console.log(db);
    }
})();

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
    console.log("Server started on port: " + PORT);
})