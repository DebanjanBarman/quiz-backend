ALTER USER postgres WITH PASSWORD 'pass1234';
CREATE DATABASE mcalab;

CREATE TABLE IF NOT EXISTS USER_DETAILS
(
    NAME     VARCHAR(50),
    ID       UUID PRIMARY KEY,
    EMAIL    VARCHAR(100) UNIQUE,
    PASSWORD VARCHAR(200),
    ROLE     VARCHAR(5) DEFAULT 'user'
    -- EVENT UUID REFERENCES EVENT_DETAILS DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS GAME
(
    ID         UUID PRIMARY KEY,
    START_TIME timestamp,
    PARAGRAPH  VARCHAR(2000),
    NAME       VARCHAR(100),
    ORGANIZER  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS PERFORMANCE
(
    ID         UUID PRIMARY KEY,
    GAME_ID    UUID REFERENCES GAME,
    USER_ID    UUID REFERENCES USER_DETAILS,
    TIME_TAKEN INTEGER
);

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
);

CREATE TABLE IF NOT EXISTS EVENT_REGISTRATIONS
(
    ID        UUID PRIMARY KEY,
    user_id   uuid REFERENCES USER_DETAILS (ID),
    event_id  uuid REFERENCES EVENT_DETAILS (ID),
    team_name character varying(100),
    status    character varying(50)
);

-- ALTER TABLE USER_DETAILS
--     ADD COLUMN EVENT UUID REFERENCES EVENT_DETAILS DEFAULT NULL;

--
-- SELECT * FROM USER_DETAILS;
-- ALTER TABLE USER_DETAILS ADD COLUMN ROLE VARCHAR(5) DEFAULT 'user';
-- ALTER TABLE USER_DETAILS DROP COLUMN ROLE;


-- 2. Quizzes table
CREATE TABLE IF NOT EXISTS Quizzes
(
    id          UUID PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    thumbnail   VARCHAR(255),
    description TEXT,
    visible     BOOLEAN     DEFAULT FALSE,
    status      VARCHAR(10) DEFAULT 'WAITING',
    created_by  UUID         REFERENCES USER_DETAILS (ID) ON DELETE SET NULL,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS Questions
(
    id             UUID PRIMARY KEY,
    quiz_id        UUID REFERENCES Quizzes (id) ON DELETE CASCADE,
    question_type  VARCHAR(10),
    question_text  TEXT DEFAULT NULL,
    question_image TEXT DEFAULT NULL
);

-- 4. Options table
CREATE TABLE IF NOT EXISTS Options
(
    id          UUID PRIMARY KEY,
    question_id UUID REFERENCES Questions (id) ON DELETE CASCADE,
    option_text TEXT NOT NULL
);

-- 5. Answers table
CREATE TABLE IF NOT EXISTS Answers
(
    id          UUID PRIMARY KEY,
    question_id UUID REFERENCES Questions (id) ON DELETE CASCADE,
    option_id   UUID REFERENCES Options (id) ON DELETE CASCADE,
    UNIQUE (question_id, option_id)
);

-- 6. User_Responses table
CREATE TABLE IF NOT EXISTS User_Responses
(
    id                 UUID PRIMARY KEY,
    user_id            UUID REFERENCES USER_DETAILS (id) ON DELETE CASCADE,
    quiz_id            UUID REFERENCES Quizzes (id) ON DELETE CASCADE,
    question_id        UUID REFERENCES Questions (id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES Options (id) ON DELETE CASCADE,
    responded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, quiz_id, question_id, selected_option_id)
);
