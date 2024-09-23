const express = require("express");
const {protect} = require("../controllers/authController")
const {getResult} = require("../controllers/resultController");
const router = express.Router();

router.get("/:quiz_id", protect, getResult);

module.exports = router;

