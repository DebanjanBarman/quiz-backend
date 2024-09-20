const {pool} = require("../DB");
const {v4: uuidv4} = require("uuid");
const {getOption, listOptions} = require("./optionController");

const quizVisible = async (quiz_id, user_id) => {
    const visible = await pool.query(
        `SELECT visible, created_by
         from quizzes
         WHERE id = $1`,
        [quiz_id]
    )
    if (visible.rows.length === 0) {
        return false;
    }
    return visible.rows[0].visible || visible.rows[0].created_by === user_id;
}

const verifyOwner = async (quiz_id, user_id) => {
    let findQuiz = await pool.query(
        "SELECT created_by FROM QUIZZES WHERE id=$1", [quiz_id]
    )

    if (findQuiz.rows.length === 0) {
        return false;
    }
    let created_by = findQuiz.rows[0].created_by;
    return created_by === user_id;
}

exports.createQuestion = async (req, res) => {
    let id = uuidv4();
    let quiz_id = req.body.quiz_id;
    let question_type = req.body.question_type;
    let question_text = req.body.question_text;
    let question_image = req.body.question_image;
    console.log(quiz_id)
    if (!quiz_id || !question_type) {
        return res.status(400).json({
            message: "please provide quiz_id and question_type"
        })
    } else if (question_type === "text" && !question_text) {
        return res.status(400).json({
            message: "please provide the question"
        })
    } else if (question_type === "image" && !question_image) {
        return res.status(400).json({
            message: "please provide the question image link"
        })
    } else if (question_type === "both" && (!question_text || !question_image)) {
        return res.status(400).json({
            message: "please provide the question text and the image link"
        })
    }

    const verified = await verifyOwner(quiz_id, req.user.id);

    try {
        if (verified) {
            const question = await pool.query(
                `INSERT INTO questions
                 values ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [id, quiz_id, question_type, question_text, question_image]
            )

            res.status(201).json({
                message: "success",
                question: question.rows[0]
            })
        } else {
            return res.status(401).json({
                message: "You're not the owner of this quiz",
            })
        }
    } catch (err) {
        res.status(400).json({
            err
        })
    }
}

exports.getQuestion = async (req, res) => {
    const id = req.params.id;
    const question = await pool.query(
        `SELECT *
         FROM questions
         WHERE id = $1`,
        [id]
    )
    if (question.rows.length === 0) {
        return res.status(404).json({
            message: "Question not found"
        })
    } else {
        const visible = await quizVisible(question.rows[0].quiz_id, req.user.id);

        if (visible) {
            return res.status(200).json({
                question: question.rows[0],
            })
        } else {
            return res.status(404).json({
                message: "The quiz related to this question is either private or doesn't exist"
            })
        }
    }

}

exports.getQuestionAndOption = async (req, res) => {
    const question_id = req.params.id;
    // req.params.id=;
    const question = await pool.query(
        `SELECT *
         FROM questions
         WHERE id = $1`,
        [question_id]
    )
    if (question.rows.length === 0) {
        return res.status(404).json({
            message: "Question not found"
        })
    } else {
        const visible = await quizVisible(question.rows[0].quiz_id, req.user.id);

        if (visible) {
            const options = await pool.query(
                `SELECT *
                 FROM options
                 where question_id = $1`, [question_id]
            );

            if (options.rows.length === 0) {
                return res.status(400).json({
                    status: "fail",
                    message: "No options exist",
                })
            } else {
                return res.status(200).json({
                    status: "success",
                    data: {
                        question: question.rows[0],
                        options: options.rows
                    },
                })
            }

        } else {
            return res.status(404).json({
                message: "The quiz related to this question is either private or doesn't exist"
            })
        }
    }
}

exports.listQuestions = async (req, res) => {
    const visible = await quizVisible(req.params.id, req.user.id);

    if (visible || req.user.id !== req.user.id) {
        const list = await pool.query(
            `SELECT *
             FROM questions
             where quiz_id = $1`,
            [req.params.id]
        )
        res.status(200).json({
            message: "success",
            data: list.rows
        })
    } else {
        return res.status(404).json({
            message: "The quiz related to this question is either private or doesn't exist"
        })
    }
}

exports.updateQuestion = async (req, res) => {
    let id = req.params.id;
    let quiz_id = req.body.quiz_id;
    let question_type = req.body.question_type;
    let question_text = req.body.question_text;
    let question_image = req.body.question_image;
    console.log(quiz_id)
    if (!quiz_id || !question_type) {
        return res.status(400).json({
            message: "please provide quiz_id and question_type"
        })
    } else if (question_type === "text" && !question_text) {
        return res.status(400).json({
            message: "please provide the question"
        })
    } else if (question_type === "image" && !question_image) {
        return res.status(400).json({
            message: "please provide the question image link"
        })
    } else if (question_type === "both" && (!question_text || !question_image)) {
        return res.status(400).json({
            message: "please provide the question text and the image link"
        })
    }

    const verified = await verifyOwner(quiz_id, req.user.id);

    try {
        if (verified) {
            const question = await pool.query(
                `UPDATE questions
                 set question_type=$1,
                     question_text=$2,
                     question_image= $3
                 WHERE id = $4
                 RETURNING *`,
                [question_type, question_text, question_image, id]
            )
            if (question.rows.length === 0) {
                return res.status(404).json({
                    message: "Question not found"
                })
            } else {
                return res.status(200).json({
                    message: "success",
                    question: question.rows[0]
                })
            }

        } else {
            return res.status(401).json({
                message: "You're not the owner of this quiz",
            })
        }
    } catch (err) {
        res.status(400).json({
            err
        })
    }
}

exports.deleteQuestion = async (req, res) => {
    const id = req.params.id;
    const quiz = await pool.query(
        `SELECT *
         FROM questions
         WHERE id = $1`,
        [id]);
    if (quiz.rows.length === 0) {
        return res.status(404).json({
            message: "Question Not found"
        })
    }
    const quiz_id = quiz.rows[0].quiz_id;


    const verified = await verifyOwner(quiz_id, req.user.id);

    if (verified) {
        const deleted = await pool.query(
            `DELETE
             FROM questions
             WHERE id = $1`,
            [id]
        );
        return res.status(200).json({
            message: "success",
        })
    } else {
        return res.status(401).json({
            message: "You're not the owner of this quiz/Question",
        })
    }
}
