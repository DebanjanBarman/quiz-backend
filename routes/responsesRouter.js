const express = require("express");
const {authorizeAdmin, protect} = require("../controllers/authController");

const {createResponse, getResponse} = require("../controllers/responseController");
const router = express.Router();

router.get("/", protect, getResponse);
router.post("/", protect, createResponse);


module.exports = router;

