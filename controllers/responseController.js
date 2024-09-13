const {v4: uuidv4} = require("uuid");
const {pool} = require("../DB");

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
    try {
        const response = await pool.query(
            `INSERT INTO user_responses
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id, user_id, quiz_id, question_id, selected_option_id]
        )
        return res.status(201).json({
            message: "success",
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