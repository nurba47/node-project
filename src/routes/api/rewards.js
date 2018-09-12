const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const { isAdmin } = require("../validators");
const Rewards = mongoose.model("Rewards");

router.all("/", auth.required, isAdmin, (req, res, next) => {
  next();
});

router.get("/", async (req, res, next) => {
  let { user_id } = req.body;
  if (!user_id) return res.sendStatus(400);

  let rewards = await Rewards.getByUser(user_id, { __v: 0 });
  return res.send({ rewards });
});

router.post("/", async (req, res, next) => {
  let { rewards } = req.body;
  res.json({ status: "ok", rewards });
});

router.put("/", async (req, res, next) => {
  let { rewards } = req.body;
  res.json({ status: "ok", rewards });
});

module.exports = router;
