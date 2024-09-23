const express = require("express");
const {protect} = require("../controllers/authController");

const {
    createResponse,
    getResponse,
    getFullResponse,
    finishResponse,
    checkEligibility, getEndingTime
} = require("../controllers/responseController");
const router = express.Router();

router.get("/", protect, getResponse);
router.get("/:quiz_id", protect, getFullResponse);
router.post("/", protect, createResponse);
router.patch("/:quiz_id", protect, finishResponse);
router.get("/eligible/:quiz_id", protect, checkEligibility);
router.get("/ending_time/:quiz_id", protect, getEndingTime);
module.exports = router;

