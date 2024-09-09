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
    const GAME = await pool.query(`
        CREATE TABLE IF NOT EXISTS GAME
        (
            ID         UUID PRIMARY KEY,
            START_TIME timestamp,
            PARAGRAPH  VARCHAR(2000),
            NAME       VARCHAR(100),
            ORGANIZER  VARCHAR(100)
        )`);
    if (GAME) {
        console.log("GAME TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const PERF = await pool.query(`
        CREATE TABLE IF NOT EXISTS PERFORMANCE
        (
            ID         UUID PRIMARY KEY,
            GAME_ID    UUID REFERENCES GAME,
            USER_ID    UUID REFERENCES USER_DETAILS,
            TIME_TAKEN INTEGER
        )`);

    if (PERF) {
        console.log("PERFORMANCE TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }

    const EVENT = await pool.query(`
        CREATE TABLE IF NOT EXISTS EVENT_DETAILS
        (
            ID          UUID PRIMARY KEY,
            NAME        VARCHAR(50),
            DESCRIPTION VARCHAR(100),
            DATE_FROM   DATE,
            DATE_TO     DATE,
            LOCATION    VARCHAR(100),
            CATEGORY    VARCHAR(20),
            STATUS      VARCHAR(50)
        )`);


    if (EVENT) {
        console.log("EVENT TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }

    const EVENT_REGISTER = await pool.query(`
        CREATE TABLE IF NOT EXISTS EVENT_REGISTRATIONS
        (
            ID        UUID PRIMARY KEY,
            user_id   uuid REFERENCES USER_DETAILS (ID),
            event_id  uuid REFERENCES EVENT_DETAILS (ID),
            team_name character varying(100),
            status    character varying(50)
        )`);

    if (EVENT_REGISTER) {
        console.log("EVENT_REGISTER TABLE CREATED/NOT TOUCHED");
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
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by  UUID         REFERENCES USER_DETAILS (ID) ON DELETE SET NULL
        )`);
    if (QUIZ) {
        console.log("QUIZ TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }
    const QUESTIONS = await pool.query(`
        CREATE TABLE IF NOT EXISTS Questions
        (
            id            UUID PRIMARY KEY,
            quiz_id       UUID REFERENCES Quizzes (id) ON DELETE CASCADE,
            question_text TEXT NOT NULL
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
            option_id   UUID REFERENCES Options (id) ON DELETE CASCADE
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
            responded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    if (USER_QUIZ_RESP) {
        console.log("USER_QUIZ_RESP TABLE CREATED/NOT TOUCHED");
    } else {
        throw new Error("Creation of Tables Failed");
    }

    return true;
}