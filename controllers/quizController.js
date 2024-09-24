const {v4: uuidv4} = require("uuid");
const {pool} = require("../DB");
const {getIo} = require('../socket');


exports.createQuiz = async (req, res) => {
    let id = uuidv4();
    let title = req.body.title;
    let description = req.body.description;
    let thumbnail = req.body.thumbnail;
    let visible = req.body.visible ? req.body.visible : false;
    let status = req.body.status ? req.body.status.toLowerCase() : "waiting";
    // "status": "WAITING:Completed:Ongoing"

    let created_at = Date.now().toLocaleString();
    let created_by = req.user.id;

    if (!title || !description || !thumbnail) {
        return res.status(400).json({
            message: "please provide title ,description and thumbnail",
        });
    }

    try {
        let quiz = await pool.query("INSERT INTO QUIZZES VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,title", [id, title, description, thumbnail, visible, status, created_by]);

        const io = getIo();
        io.emit("quiz_updated");

        return res.status(201).json({
            message: "quiz created successfully", quiz_id: quiz.rows[0].id, quiz_title: quiz.rows[0].title,
        })
    } catch (err) {
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }

}

exports.getQuiz = async (req, res) => {
    let id = req.params.id;

    try {
        let quiz = await pool.query("SELECT * FROM  QUIZZES WHERE ID=$1", [id]);
        if (quiz.rows.length === 0) {
            return res.status(404).json({
                message: "quiz not found",
            })
        }
        if (quiz.rows[0].visible === false && quiz.rows[0].created_by !== req.user.id) {
            res.status(200).json({
                message: "quiz is private",
            })
        } else {
            res.status(200).json({
                message: "success", quiz: quiz.rows[0]
            })
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }
}

exports.getAllQuizzes = async (req, res) => {

    try {
        let quiz = await pool.query("SELECT * FROM  QUIZZES WHERE visible=true",);

        res.status(200).json({
            message: "success", quiz: quiz.rows
        })

    } catch (err) {
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }
};

exports.getMyQuizzes = async (req, res) => {
    let user_id = req.user.id;
    try {
        let quiz = await pool.query("SELECT * FROM  QUIZZES WHERE created_by=$1", [user_id]);

        res.status(200).json({
            message: "success", quiz: quiz.rows
        })

    } catch (err) {
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }

}

exports.deleteQuiz = async (req, res) => {
    let user_id = req.user.id;
    let id = req.params.id;

    try {
        let findQuiz = await pool.query(
            "SELECT created_by FROM QUIZZES WHERE id=$1", [id]
        )
        if (findQuiz.rows.length === 0) {
            return res.status(404).json({
                message: "quiz not found"
            })
        }
        let created_by = findQuiz.rows[0].created_by;

        if (created_by === user_id) {
            let quiz = await pool.query(
                "DELETE FROM QUIZZES  WHERE id=$1",
                [id]
            );
            const io = getIo();
            io.emit("quiz_updated");

            return res.status(200).json({
                message: "quiz DELETED successfully",
            })
        } else {
            res.status(400).json({
                message: "You are not the owner of this quiz",
            })
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }

}

exports.editQuiz = async (req, res) => {
    let user_id = req.user.id;

    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let thumbnail = req.body.thumbnail;
    let visible = req.body.visible ? req.body.visible : false;
    let status = req.body.status ? req.body.status.toLowerCase() : "waiting";
    // "status": "WAITING:Completed:Ongoing"


    if (!title || !description || !thumbnail) {
        return res.status(400).json({
            message: "please provide title ,description and thumbnail",
        });
    }

    try {
        let findQuiz = await pool.query(
            "SELECT created_by FROM QUIZZES WHERE id=$1", [id]
        )
        if (findQuiz.rows.length === 0) {
            return res.status(404).json({
                message: "Quiz not found",
            })
        }
        let created_by = findQuiz.rows[0].created_by;

        if (created_by === user_id) {
            let quiz = await pool.query(
                "UPDATE QUIZZES SET title=$1,description=$2,thumbnail=$3,visible=$4,status=$5  WHERE id=$6 RETURNING *",
                [title, description, thumbnail, visible, status, id]
            );

            const io = getIo();
            io.emit("quiz_updated");

            return res.status(200).json({
                message: "quiz updated successfully",
                quiz: quiz.rows[0]
            })
        } else {
            res.status(400).json({
                message: "You are not the owner of this quiz",
            })
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: "something went wrong", error: err
        })
    }

}
