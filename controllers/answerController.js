const {pool} = require("../DB");
const {v4: uuidv4} = require("uuid");

const {verifyOwner} = require("../utils/utils");

// exports.verifyOwner = async (req, res, question_id, user_id) => {

exports.createAnswer = async (req, res) => {
    const id = uuidv4();
    const question_id = req.params.id;
    const option_id = req.body.option_id;

    const verified = await verifyOwner(req, res, question_id, req.user.id);

    // Check for valid option
    if (verified) {
        try {
            const answer = await pool.query(
                `INSERT INTO answers
                 values ($1, $2, $3)
                 RETURNING *`,
                [id, question_id, option_id]
            )
            return res.status(201).json({
                message: "success",
                data: answer.rows[0]
            })
        } catch (err) {
            if (err.code === "23505") {
                return res.status(400).json({
                    status: "failed",
                    message: "This answer already exists for this question"
                })
            }
            console.log(err)
        }
    } else {
        return res.status(401).json({
            message: "You're not authorized to edit this answer",
        })
    }

}

exports.getAnswer = async (req, res) => {
    const question_id = req.params.id;

    const answer = await pool.query(
        `SELECT *
         FROM answers
         WHERE question_id = $1`,
        [question_id]
    )
    // if (answer.rows.length === 0) {
    //     return res.status(404).json({
    //         status: "fail",
    //         message: "Either question doesn't exit or answer is not added"
    //     })
    // }
    return res.status(200).json({
        message: "success",
        data: answer.rows
    })
}

exports.updateAnswer = async (req, res) => {

}

exports.deleteAnswer = async (req, res) => {
    const answer_id = req.params.id;

    const question = await pool.query(
        'SELECT question_id FROM answers WHERE id = $1', [answer_id]
    );
    if (question.rows.length === 0) {
        return res.status(404).json({
            status: "fail",
            message: "Answers not found"
        })
    }
    const question_id = question.rows[0].question_id;
    console.log(question_id)

    const verified = await verifyOwner(req, res, question_id, req.user.id);

    // Check for valid option
    if (verified) {
        try {
            const answer = await pool.query(
                `DELETE
                 FROM answers
                 WHERE id = $1`,
                [answer_id]
            )
            return res.status(200).json({
                message: "success",
            })
        } catch (err) {
            return res.status(400).json({
                status: "failed",
                message: "Deletion Failed"
            })
        }
    } else {
        return res.status(401).json({
            message: "You're not authorized to edit this answer",
        })
    }

}

exports.validateAnswer = async (question_id, selected_option_id) => {

    try {
        const answer = await pool.query(
            `SELECT *
             FROM answers
             WHERE question_id = $1`,
            [question_id]
        );

        if (answer.rows.length === 0) {
            return false;
        } else {
            console.log(answer.rows[0].option_id)
            console.log(selected_option_id)
            return answer.rows[0].option_id === selected_option_id;
        }
    } catch (err) {
        console.log(err)
        return false;
    }
}