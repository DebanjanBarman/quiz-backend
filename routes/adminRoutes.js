const express = require("express");
const {admitUser, rejectUser} = require("../controllers/adminController");
const {authorizeAdmin, protect} = require("../controllers/authController");
const router = express.Router();

// router.get("/:id", protect, createAnswer);
router.post("/admit-user", protect, authorizeAdmin, admitUser);
router.post("/reject-user", protect, authorizeAdmin, rejectUser);

module.exports = router;

