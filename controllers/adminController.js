const {v4: uuidv4} = require("uuid");
const pool = require("../DB/index.js").pool;
const {getIo} = require('../socket');

exports.admitUser = async (req, res) => {
    const id = uuidv4();
    const quiz_id = req.body.quiz_id;
    const user_id = req.body.user_id;
    //Admit the user but don't start the game
    const start_time = Date.now();
    // end time is less than start time which means game is not accepting response
    const end_time = start_time - 10000;
    const actual_end_time = end_time;
    const finished = false;
    try {
        const response = await pool.query(
            `INSERT INTO user_quiz_score
             values ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *
            `, [id, quiz_id, user_id, start_time, end_time, actual_end_time, finished]
        );
        const delete_pending_req = await pool.query(`
            DELETE
            FROM pending_requests
            WHERE user_id = $1
              AND quiz_id = $2
        `, [user_id, quiz_id]);

        const io = getIo();
        io.emit("quiz_updated");

        return res.status(201).send({
            message: "Request Accepted",
            data: response.rows[0]
        })
    } catch (err) {
        return res.status(400).send({
            message: "something went wrong", error: err
        })
    }


}

exports.rejectUser = async (req, res) => {
    const user_id = req.body.user_id;
    const quiz_id = req.body.quiz_id;

    try {
        const response = await pool.query(`
            DELETE
            FROM pending_requests
            WHERE user_id = $1
              AND quiz_id = $2
        `, [user_id, quiz_id])

        return res.status(200).send({
            message: "Request Rejected",
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            message: "something went wrong",
            err
        })

    }
}