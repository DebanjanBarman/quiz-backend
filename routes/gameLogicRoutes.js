const express = require("express");
const {joinRequest, pendingRequests} = require("../controllers/gameLogicController");
const {authorizeAdmin, protect} = require("../controllers/authController");

const router = express.Router();

router.post("/join-req", protect, joinRequest);
router.get("/pending-request/:quiz_id", protect, authorizeAdmin, pendingRequests);

module.exports = router;

