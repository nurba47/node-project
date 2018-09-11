const express = require("express");
const router = express.Router();

router.use("/users", require("./users"));
router.use("/rewards", require("./rewards"));

module.exports = router;
