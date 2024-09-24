const {pool} = require("../DB");
const {v4: uuidv4} = require("uuid");
const {verifyOwner} = require("../utils/utils");

exports.joinRequest = async (req, res) => {
    const {user_id, quiz_id, user_name, user_email} = req.body;
    const id = uuidv4();

    console.log({user_id, quiz_id, user_name, user_email})
    try {
        const response = await pool.query(`INSERT INTO pending_requests
                                           VALUES ($1, $2, $3, $4, $5)
                                           RETURNING *
        `, [id, quiz_id, user_id, user_name, user_email]);
        res.status(200).send({
            message: "success", data: response.rows[0]
        })

    } catch (err) {
        console.log(err);
        res.status(400).send({
            message: "failed"
        })

    }

}

exports.pendingRequests = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;

    try {
        const QUIZ = await pool.query(
            `SELECT *
             FROM quizzes
             where id = $1`, [quiz_id]);
        if (QUIZ.rows.length === 0) {
            return res.status(404).json({
                message: "Quiz Not found"
            })
        }
        console.log(QUIZ.rows[0]);
        const REQUESTS = await pool.query(
            `SELECT *
             FROM pending_requests
             WHERE quiz_id = $1`, [quiz_id])
        if (REQUESTS.rows.length === 0) {
            return res.status(200).json({
                message: "NO REQUESTS ARE THERE",
                data: REQUESTS.rows
            })
        }
        if (user_id === QUIZ.rows[0].created_by) {
            return res.status(200).json({
                message: "success",
                data: REQUESTS.rows
            })

        } else {
            return res.status(401).json({
                message: "You're not the owner of this quiz"
            })

        }
    } catch (err) {

    }
}