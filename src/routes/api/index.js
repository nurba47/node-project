const express = require("express");
const router = express.Router();

router.use("/users", require("./users"));
router.use("/drugs", require("./drugs"));

module.exports = router;
