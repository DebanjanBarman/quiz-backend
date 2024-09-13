const express = require("express");
const {authorizeAdmin, protect} = require("../controllers/authController");
const {createOption, listOptions, updateOption, deleteOption, getOption} = require("../controllers/optionController")
const router = express.Router();

router.get("/:id", protect, getOption);
router.get("/all/:id", protect, listOptions);
router.post("/:id", protect, createOption);
router.patch("/:id", protect, updateOption);
router.delete("/:id", protect, deleteOption);


module.exports = router;
