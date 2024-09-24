const {pool} = require("../DB");
const {v4: uuidv4} = require("uuid");
const {verifyOwner} = require("../utils/utils");
const {getIo} = require('../socket');

exports.joinRequest = async (req, res) => {
    const {user_id, quiz_id, user_name, user_email} = req.body;
    const id = uuidv4();

    console.log({user_id, quiz_id, user_name, user_email})
    try {
        const response = await pool.query(`INSERT INTO pending_requests
                                           VALUES ($1, $2, $3, $4, $5)
                                           RETURNING *
        `, [id, quiz_id, user_id, user_name, user_email]);

        const io = getIo();
        io.emit("new-join-request");

        return res.status(200).send({
            message: "success", data: response.rows[0]
        })

    } catch (err) {
        console.log(err);
        if (parseInt(err.code) === 23505) {
            return res.status(400).send({
                message: "You've already sent a join request"
            })
        }
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

exports.joinRequestSent = async (req, res) => {
    const user_id = req.user.id;
    const quiz_id = req.params.quiz_id;

    try {
        const pending = await pool.query(
            `SELECT *
             FROM pending_requests
             WHERE user_id = $1
               AND quiz_id = $2`,
            [user_id, quiz_id]
        );

        if (pending.rows.length === 0) {
            const acceptedUser = await pool.query(
                `SELECT *
                 FROM user_quiz_score
                 WHERE user_id = $1
                   AND quiz_id = $2`,
                [user_id, quiz_id]
            )

            if (acceptedUser.rows.length === 0) {
                return res.status(404).json({
                    status: "fail",
                    message: "(No request sent or accepted) (or request rejected)"
                })
            } else {
                return res.status(200).send({
                    message: "success",
                })
            }
        }

        return res.status(200).send({
            message: "success",
        })
    } catch (err) {

    }
}

exports.startQuiz = async (req, res) => {
    const quiz_id = req.params.quiz_id;
    const time = parseInt(req.body.time);
    const start_time = Date.now();
    const end_time = (Date.now() + 5000) + (time * 1000 * 60);

    console.log({quiz_id, time, start_time, end_time})
    try {
        const response = await pool.query(
            `UPDATE user_quiz_score
             set start_time=$1,
                 end_time=$2
             WHERE quiz_id = $3
             RETURNING id
            `,
            [start_time, end_time, quiz_id]
        )
        if (response.rows.length === 0) {
            return res.status(400).json({
                message: "No participants to start the game",
            })
        }
        const updateQuiz = await pool.query(
            `UPDATE quizzes
             SET status='LIVE'
             WHERE id = $1`, [quiz_id]
        );

        setTimeout(async () => {
            const finishQuiz = await pool.query(
                `UPDATE quizzes
                 SET status='COMPLETED'
                 WHERE id = $1
                 RETURNING *`, [quiz_id]
            );
            console.log(finishQuiz.rows)
            const io = getIo();
            io.emit("quiz_updated");
        }, end_time - start_time);

        const io = getIo();
        io.emit("quiz_updated");

        return res.status(200).json({
            message: "success",
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "failed to start the game",
        })
    }
}