const express = require("express");
const {authorizeAdmin, protect} = require("../controllers/authController");
const {createAnswer, getAnswer, updateAnswer, deleteAnswer} = require("../controllers/answerController");
const router = express.Router();

// router.get("/:id", protect, createAnswer);
router.get("/:id", protect, getAnswer);
router.post("/:id", protect, createAnswer);
router.delete("/:id", protect, deleteAnswer);

// NOT DONE UPDATE
router.patch("/:id", protect, updateAnswer);

module.exports = router;

