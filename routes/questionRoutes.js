const express = require("express");
const { authorizeAdmin, protect } = require("../controllers/authController");
const {
  createQuestion,
  getQuestion,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionAndOption
} = require("../controllers/questionController");

const router = express.Router();

router.post("/", protect, createQuestion);
router.get("/:id", protect, getQuestion);
router.get("/:id/options", protect, getQuestionAndOption);
router.get("/list/:id", protect, listQuestions);
router.patch("/:id", protect, updateQuestion);
router.delete("/:id", protect, deleteQuestion);

module.exports = router;
