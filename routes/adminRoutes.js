const express = require("express");
const {admitUser} = require("../controllers/adminController");
const {authorizeAdmin, protect} = require("../controllers/authController");
const router = express.Router();

// router.get("/:id", protect, createAnswer);
router.post("/admit-user", protect, authorizeAdmin, admitUser);

module.exports = router;

