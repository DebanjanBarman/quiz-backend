const express = require("express");
const {protect} = require("../controllers/authController")
const {getResult, listAcceptedUsers} = require("../controllers/resultController");
const router = express.Router();

router.get("/:quiz_id", protect, getResult);
router.get("/accepted-users/:quiz_id", protect, listAcceptedUsers);
module.exports = router;

