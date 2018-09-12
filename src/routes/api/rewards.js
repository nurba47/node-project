const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const { isAdmin } = require("../validators");
const Rewards = mongoose.model("Rewards");

router.get("/user", auth.required, async (req, res, next) => {
  let { id } = req.payload;

  let rewards = await Rewards.getByUser(id, { __v: 0 });
  return res.send({ rewards });
});

router.get("/:user_id", auth.required, isAdmin, async (req, res, next) => {
  let { user_id } = req.params;
  if (!user_id) return res.sendStatus(400);

  let rewards = await Rewards.getByUser(user_id, { __v: 0 });
  return res.send({ rewards });
});

router.post("/", auth.required, isAdmin, async (req, res, next) => {
  let { user_id, rewards } = req.body;
  rewards.forEach(r => {
    r.userId = user_id;
  });
  let result;
  try {
    result = await Rewards.insertMany(rewards);
  } catch (error) {
    return res.sendStatus(400);
  }

  result.forEach(r => {
    delete r.__v;
    delete r.userId;
  });

  return res.json({ result });
});

router.put("/", auth.required, isAdmin, async (req, res, next) => {
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
