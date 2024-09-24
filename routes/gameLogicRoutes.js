const express = require("express");
const {joinRequest, pendingRequests, joinRequestSent, startQuiz} = require("../controllers/gameLogicController");
const {authorizeAdmin, protect} = require("../controllers/authController");

const router = express.Router();

router.post("/join-req", protect, joinRequest);
router.get("/pending-request/:quiz_id", protect, authorizeAdmin, pendingRequests);
router.get("/join-req-sent/:quiz_id", protect, joinRequestSent);
router.post("/start-quiz/:quiz_id", protect, authorizeAdmin, startQuiz);
module.exports = router;

