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
  Rewards.getByUser(user._id, { __v: 0 })
    .then(rewards => res.json({ rewards }))
    .catch();
});

router.post("/", async (req, res, next) => {
  return res.send({ status: "OK", rewards });
});

module.exports = router;
