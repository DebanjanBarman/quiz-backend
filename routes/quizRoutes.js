const express = require("express");
const quizController = require("../controllers/quizController");
const { authorizeAdmin, protect } = require("../controllers/authController");

const router = express.Router();

router.get("/", protect, quizController.getAllQuizzes);
router.get("/my-quizzes", protect, quizController.getMyQuizzes);
router.get("/:id", protect, quizController.getQuiz);
router.post("/", protect, quizController.createQuiz);
router.delete("/:id", protect, quizController.deleteQuiz);
router.patch("/:id", protect, quizController.editQuiz);

module.exports = router;
