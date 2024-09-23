const {v4: uuidv4} = require("uuid");
const pool = require("../DB/index.js").pool;

exports.admitUser = async (req, res) => {
    const id = uuidv4();
    const quiz_id = req.body.quiz_id;
    const user_id = req.body.user_id;
    const start_time = Date.now();
    const end_time = Date.now() + 20000;
    const actual_end_time = end_time;
    const finished = false;
    try {
        const response = await pool.query(
            `INSERT INTO user_quiz_score
             values ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *
            `, [id, quiz_id, user_id, start_time, end_time, actual_end_time, finished]
        );

        return res.status(201).send({
            message: "Permission approved",
            data: response.rows[0]
        })
    } catch (err) {
        return res.status(400).send({
            message: "something went wrong", error: err
        })
    }


}