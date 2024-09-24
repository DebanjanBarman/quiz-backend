const {v4: uuidv4} = require("uuid");
const {pool} = require("../DB");
const {validateAnswer} = require("./answerController");


const checkResponsePermission = async (user_id, quiz_id) => {
    try {
        const response = await pool.query(
            `SELECT *
             FROM user_quiz_score
             WHERE user_id = $1
               AND quiz_id = $2
            `,
            [user_id, quiz_id]
        );

        const data = response.rows;

        if (response.rows.length === 0) {
            return false;
        } else if ((parseInt(data[0].end_time) + 5000) - Date.now() < 0) {
            return false;
        } else if (data[0].ended === true) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

exports.createResponse = async (req, res) => {
    const {
        quiz_id, question_id, selected_option_id
    } = req.body;

    const user_id = req.user.id;

    if (!quiz_id || !selected_option_id || !question_id) {
        return res.status(400).send({
            status: "fail",
            message: "please provide user_id, quiz_id, question_id,selected_option_id"
        })
    }
    const id = uuidv4();
    const eligible = await checkResponsePermission(user_id, quiz_id);
    if (!eligible) {
        return res.status(400).send({
            status: "fail",
            message: "You're not allowed to submit any response"
        })
    }
    try {
        const response = await pool.query(
            `INSERT INTO user_responses
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id, user_id, quiz_id, question_id, selected_option_id]
        )
        const validAnswer = await validateAnswer(question_id, selected_option_id);

        let savedScore;
        if (validAnswer) {
            const updateScore = await pool.query(
                `UPDATE USER_QUIZ_SCORE
                 SET score=score + 1
                 WHERE quiz_id = $1
                   AND user_id = $2
                 RETURNING score,incorrect_answers
                `, [quiz_id, user_id]);
            savedScore = updateScore.rows[0];
        } else {
            const updateScore = await pool.query(
                `UPDATE USER_QUIZ_SCORE
                 SET incorrect_answers=incorrect_answers + 1
                 WHERE quiz_id = $1
                   AND user_id = $2
                 RETURNING score,incorrect_answers
                `, [quiz_id, user_id])
            savedScore = updateScore.rows[0];
        }
        return res.status(201).json({
            message: "success",
            correct_answer: validAnswer,
            savedScore,
            data: response.rows
        })
    } catch (err) {
        console.log(err)
        if (err.code === '23505') {
            return res.status(400).send({
                status: "fail",
                message: "You've already responded for this question",
            })
        } else {
            return res.status(400).send({
                status: "fail",
                message: "either question or quiz or option invalid"
            })
        }

    }
}

exports.getResponse = async (req, res) => {
    const user_id = req.user.id;
    const {quiz_id, question_id} = req.body;

    if (!quiz_id || !question_id) {
        return res.status(400).send({
            status: "fail",
            message: "please provide  quiz_id, question_id"
        })
    }
    try {
        const response = await pool.query(
            `SELECT *
             FROM user_responses
             WHERE user_id = $1
               AND quiz_id = $2
               AND question_id = $3`,
            [user_id, quiz_id, question_id]
        )
        if (response.rows.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "No such response exists"
            })
        }
        return res.status(200).json({
            status: "success",
            data: response.rows
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: "fail",
            err
        })
    }
}

exports.getFullResponse = async (req, res) => {
    const quiz_id = req.params.quiz_id;
    const user_id = req.user.id;

    try {
        const response = await pool.query(
            `SELECT *
             FROM user_responses u
                      JOIN questions q ON u.question_id = q.id
                      JOIN answers a ON a.question_id = q.id
             WHERE u.user_id = $1
               and q.quiz_id = $2;
            `, [user_id, quiz_id])
        console.log(response)
        return res.status(200).json({
            response: response.rows
        })
    } catch (err) {
        console.log(err)
    }
}

exports.finishResponse = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;
    const end_time = Date.now();
    console.log({user_id, quiz_id})
    const eligible = await checkResponsePermission(user_id, quiz_id);

    if (eligible) {
        try {
            const response = await pool.query(`
                UPDATE USER_QUIZ_SCORE
                SET actual_end_time=$1,
                    ended= true
                WHERE quiz_id = $2
                  AND user_id = $3
                RETURNING *
            `, [end_time, quiz_id, user_id]);
            // console.log(response.rows[0])
            if (response.rows.length === 0) {
                return res.status(400).json({
                    message: "You are not allowed to submit any response",
                })
            } else {
                return res.status(200).json({
                    message: "success",
                    data: response.rows[0]
                })
            }

        } catch (e) {
            console.log(e)
            return res.status(400).json({
                message: "fail",
            })
        }
    } else {
        return res.status(400).json({
            message: "You are not allowed to submit any response",
        })
    }

}

exports.checkEligibility = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;

    const eligible = await checkResponsePermission(user_id, quiz_id);

    if (!eligible) {
        return res.status(400).json({
            status: "fail",
            message: "You're not allowed to make any response"
        })
    }

    return res.status(200).json({
        status: "success",
        message: "You are allowed to make response"
    })

}

exports.getEndingTime = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;

    try {
        const response = await pool.query(
            `SELECT end_time
             FROM USER_QUIZ_SCORE
             WHERE user_id = $1
               AND quiz_id = $2`, [user_id, quiz_id]
        )

        console.log(response.rows)

        return res.status(200).json({
            message: "success",
            response: response.rows,
            current_time: Date.now(),
        })

    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: "failed"
        })
    }
}

exports.checkParticipation = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;

    try {
        const response = await pool.query(
            `SELECT *
             FROM USER_QUIZ_SCORE
             WHERE user_id = $1
               AND quiz_id = $2
            `, [user_id, quiz_id]
        );
        if (response.rows.length === 0) {
            return res.status(400).json({
                status: "success",
                message: "Not Participated"
            })
        }
        return res.status(200).json({
            status: "success",
            data: response.rows[0]
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            status: "fail",
            message: "something went wrong"
        })
    }
}