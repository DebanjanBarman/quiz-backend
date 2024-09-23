const {pool} = require("../DB");

exports.getResult = async (req, res) => {
    const quiz_id = req.params.quiz_id;

    const result = await pool.query(
        `SELECT ud.id,
                ud.name,
                ud.email,
                uqs.score,
                uqs.incorrect_answers,
                uqs.actual_end_time - uqs.start_time as time_taken
         FROM user_quiz_score uqs
                  JOIN user_details ud ON ud.id = uqs.user_id
         WHERE quiz_id = $1
         ORDER BY score
        `, [quiz_id]
    );

    // console.log(result)
    return res.status(200).json({
        message: "success",
        data: result.rows
    })
}