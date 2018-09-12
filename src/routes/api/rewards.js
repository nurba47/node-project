const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const { isAdmin } = require("../validators");
const Rewards = mongoose.model("Rewards");

router.all("/", auth.required, isAdmin, (req, res, next) => {
  next();
});

router.get("/:user_id", async (req, res, next) => {
  let { user_id } = req.params;
  if (!user_id) return res.sendStatus(400);

  let rewards = await Rewards.getByUser(user_id, { __v: 0 });
  return res.send({ rewards });
});

router.post("/", async (req, res, next) => {
  let { user_id, rewards } = req.body;
  rewards.forEach(r => {
    r.userId = user_id;
  });
  let result;
  try {
    result = await Rewards.insertMany(rewards);
  } catch (error) {
    console.log(error)
    return res.sendStatus(400);
  }

  result.forEach(r => {
    delete r.__v;
    delete r.userId;
  });

  return res.json({ result });
});

router.put("/", async (req, res, next) => {
  let { user_id, rewards } = req.body;
  if (!user_id) return res.sendStatus(400);

  let updates = rewards.map(r => {
    return {
      updateOne: {
        filter: { userId: user_id, _id: r._id },
        update: { date: r.date, income: r.income, withdraw: r.withdraw }
      }
    };
  });

  let result;
  try {
    result = await Rewards.bulkWrite(updates);
  } catch (error) {
    return res.sendStatus(400);
  }

  return res.json({ result });
});

module.exports = router;
