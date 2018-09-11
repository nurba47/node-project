const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const { isAdmin, validateUser } = require("../validators");
const Rewards = mongoose.model("Rewards");

router.all("/", auth.required, validateUser, isAdmin, (req, res, next) => {
  next();
});

router.get("/", async (req, res, next) => {
  let { user } = req.payload;
  let rewards = await Rewards.getByUser(user._id, { __v: 0 });
  return res.send({ rewards });
});

router.post("/", async (req, res, next) => {
  let { rewards } = req.body;
  res.json({ status: "ok", rewards });
});

module.exports = router;
