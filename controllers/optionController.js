const {pool} = require("../DB");
const {v4: uuidv4} = require("uuid");
const {verifyOwner} = require("../utils/utils");


exports.createOption = async (req, res) => {
    const question_id = req.params.id;
    const id = uuidv4();
    const option_text = req.body.option;

    if (!option_text) {
        return res.status(400).send({
            status: "fail",
            message: "please provide option"
        })
    }
    console.log({id, question_id, option_text})
    const verified = await verifyOwner(req, res, question_id, req.user.id);

    try {
        if (verified) {
            const option = await pool.query(
                `INSERT INTO options
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [id, question_id, option_text]
            )

            return res.status(201).json({
                message: "success",
                data: option.rows[0]
            })
        } else {
            return res.status(401).send({
                status: "unauthorized",
                message: "You're not the owner of this Quiz/Question"
            })
        }
    } catch (err) {
        console.log(err)
        //return// res.status(400).send({err})
    }


}
exports.updateOption = async (req, res) => {
    const option_id = req.params.id;
    const option_text = req.body.option;

    if (!option_text) {
        return res.status(400).send({
            status: "fail",
            message: "please provide option"
        })
    }

    const question = await pool.query(
        `SELECT question_id
         FROM options
         WHERE id = $1 `,
        [option_id]
    )
    if (question.rows.length === 0) {
        return res.status(404).send({
            status: "fail",
            message: "Question not found"
        })
    }
    const question_id = question.rows[0].question_id;
    console.log(question_id)
    const verified = await verifyOwner(req, res, question_id, req.user.id);

    try {
        if (verified) {
            const option = await pool.query(
                `UPDATE OPTIONS
                 SET option_text=$1
                 WHERE id = $2
                 RETURNING *`,
                [option_text, option_id]
            )

            return res.status(200).json({
                message: "success",
                data: option.rows[0]
            })
        } else {
            return res.status(401).send({
                status: "unauthorized",
                message: "You're not the owner of this Quiz/Question"
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).send({err})
    }


}

exports.deleteOption = async (req, res) => {
    const option_id = req.params.id;

    const question = await pool.query(
        `SELECT question_id
         FROM options
         WHERE id = $1 `,
        [option_id]
    )
    if (question.rows.length === 0) {
        return res.status(404).send({
            status: "fail",
            message: "Question not found"
        })
    }
    const question_id = question.rows[0].question_id;
    console.log(question_id)
    const verified = await verifyOwner(req, res, question_id, req.user.id);

    try {
        if (verified) {
            const option = await pool.query(
                `DELETE
                 FROM options
                 WHERE id = $1`,
                [option_id]
            )
            return res.status(200).json({
                status: "success",
                "message": "deleted"
            })
        } else {
            return res.status(401).send({
                status: "unauthorized",
                message: "You're not the owner of this Quiz/Question"
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).send({err})
    }


}
exports.getOption = async (req, res) => {
    const option_id = req.params.id;

    const option = await pool.query(
        `SELECT *
         FROM options
         WHERE id = $1`,
        [option_id]
    );
    if (option.rows.length === 0) {
        return res.status(404).send({
            "status": "fail",
            message: "Option doesn't exit"
        })
    }
    return res.status(200).json({
        message: "success",
        data: option.rows[0],
    })
}
exports.listOptions = async (req, res) => {
    const question_id = req.params.id;

    const options = await pool.query(
        `SELECT *
         FROM options
         where question_id = $1`, [question_id]
    );

    if (options.rows.length === 0) {
        return res.status(404).send({
            "status": "fail",
            message: "Question doesn't exit"
        })
    }
    return res.status(200).json({
        message: "success",
        data: options.rows,
    })
}
