const {pool} = require("../DB");

// Check if the quiz related to the question and option has same owner
exports.verifyOwner = async (req, res, question_id, user_id) => {

    const question = await pool.query(
        `SELECT quiz_id
         FROM questions
         WHERE id = $1`,
        [question_id]
    )
    console.log(question.rows)
    if (question.rows.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "Question not found"
        })
    } else {
        const quiz_id = question.rows[0].quiz_id;

        const quiz = await pool.query(
            `SELECT created_by
             FROM quizzes
             WHERE id = $1`,
            [quiz_id]
        )
        if (quiz.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Quiz not found"
            })
        }
        const created_by = quiz.rows[0].created_by;
        console.log(created_by);
        return created_by === user_id;

    }
}
