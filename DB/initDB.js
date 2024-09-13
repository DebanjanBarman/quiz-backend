const {pool} = require("./index")

exports.initializeDB = async () => {
    const USER = await pool.query(`
        CREATE TABLE IF NOT EXISTS USER_DETAILS
        (
            NAME     VARCHAR(50),
            ID       UUID PRIMARY KEY,
            EMAIL    VARCHAR(100) UNIQUE,
            PASSWORD VARCHAR(200),
            ROLE     VARCHAR(5) DEFAULT 'user'
        )`);

    if (USER) {
        console.log("USER TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }

    // QUIZ GAME

    const QUIZ = await pool.query(`
        CREATE TABLE IF NOT EXISTS Quizzes
        (
            id          UUID PRIMARY KEY,
            title       VARCHAR(255) NOT NULL,
            description TEXT,
            thumbnail   VARCHAR(255),
            visible     BOOLEAN     DEFAULT FALSE,
            status      VARCHAR(10) DEFAULT 'WAITING',
            created_by  UUID         REFERENCES USER_DETAILS (ID) ON DELETE SET NULL,
            created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
        )`);
    if (QUIZ) {
        console.log("QUIZ TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const QUESTIONS = await pool.query(`
        CREATE TABLE IF NOT EXISTS Questions
        (
            id             UUID PRIMARY KEY,
            quiz_id        UUID REFERENCES Quizzes (id) ON DELETE CASCADE,
            question_type  VARCHAR(10),
            question_text  TEXT DEFAULT NULL,
            question_image TEXT DEFAULT NULL
        )`);
    if (QUESTIONS) {
        console.log("QUESTIONS TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const OPTIONS = await pool.query(`
        CREATE TABLE IF NOT EXISTS Options
        (
            id          UUID PRIMARY KEY,
            question_id UUID REFERENCES Questions (id) ON DELETE CASCADE,
            option_text TEXT NOT NULL
        )`);
    if (OPTIONS) {
        console.log("OPTIONS TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const ANSWER = await pool.query(`
        CREATE TABLE IF NOT EXISTS Answers
        (
            id          UUID PRIMARY KEY,
            question_id UUID REFERENCES Questions (id) ON DELETE CASCADE,
            option_id   UUID REFERENCES Options (id) ON DELETE CASCADE,
            UNIQUE (question_id, option_id)
        )`);
    if (ANSWER) {
        console.log("ANSWER TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const USER_QUIZ_RESP = await pool.query(`
        CREATE TABLE IF NOT EXISTS User_Responses
        (
            id                 UUID PRIMARY KEY,
            user_id            UUID REFERENCES USER_DETAILS (id) ON DELETE CASCADE,
            quiz_id            UUID REFERENCES Quizzes (id) ON DELETE CASCADE,
            question_id        UUID REFERENCES Questions (id) ON DELETE CASCADE,
            selected_option_id UUID REFERENCES Options (id) ON DELETE CASCADE,
            responded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, quiz_id, question_id, selected_option_id)
        )`);
    if (USER_QUIZ_RESP) {
        console.log("USER_QUIZ_RESP TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }

    return true;
}
