const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");
const { validateUser, isAdmin } = require("../validators");
const Users = mongoose.model("Users");
const Rewards = mongoose.model("Rewards");

router.get("/own/", auth.required, validateUser, async (req, res, next) => {
  let { user } = req.payload;

  let rewards = await Rewards.getByUser(user._id, { __v: 0 });
  return res.send({
    active: user.active,
    benefits: user.benefits,
    points: user.points,
    totalPoints: user.totalPoints,
    rewards
  });
});

// Only admin has access to endpoints below
router.get("/:user_id", auth.required, isAdmin, async (req, res, next) => {
  let { user_id } = req.params;
  if (!user_id) return res.sendStatus(400);

  let userData = await Users.findById(user_id, { children: 0 });
  let rewards = await Rewards.getByUser(user_id, { __v: 0 });
  return res.send({
    active: userData.active,
    benefits: userData.benefits,
    points: userData.points,
    totalPoints: userData.totalPoints,
    rewards
  });
});

router.post("/", auth.required, isAdmin, async (req, res, next) => {
  let { user_id, rewards } = req.body;
  if (!user_id || !rewards || !rewards.length) return res.sendStatus(400);

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
  let { user_id, rewards, active, benefits, points, totalPoints } = req.body;
  if (!user_id) return res.sendStatus(400);

  let noRewards = !rewards || !rewards.length;
  let noActive = active === undefined;
  let noBenefits = benefits === undefined;
  let noPoints = points === undefined;
  let noTotalPoints = totalPoints === undefined;
  if (noRewards && noActive && noBenefits && noPoints && noTotalPoints) return res.sendStatus(400);

  let result = {};

  let userUpdates = {};
  if (active === true || active === false) userUpdates.active = active;
  if (benefits === true || benefits === false) userUpdates.benefits = benefits;
  if (points) userUpdates.points = points;
  if (totalPoints) userUpdates.totalPoints = totalPoints;
  if (Object.keys(userUpdates).length > 0) {
    try {
      await Users.findByIdAndUpdate(user_id, { $set: userUpdates });
    } catch (error) {
      return res.sendStatus(400);
    }
  }

  if (rewards && rewards.length) {
    let rewardUpdates = rewards.map(r => {
      return {
        updateOne: {
          filter: { userId: user_id, _id: r._id },
          update: { date: r.date, income: r.income, withdraw: r.withdraw }
        }
      };
    });

    try {
      result.rewards = await Rewards.bulkWrite(rewardUpdates);
    } catch (error) {
      return res.sendStatus(400);
    }
  }
  return res.json(result);
});

router.delete("/", auth.required, isAdmin, async (req, res, next) => {
  let { user_id, reward_ids } = req.body;
  if (!user_id || !reward_ids || !reward_ids.length) return res.sendStatus(400);

  let deletes = reward_ids.map(id => {
    return {
      deleteOne: {
        filter: { userId: user_id, _id: id }
      }
    };
  });

  let result;
  try {
    result = await Rewards.bulkWrite(deletes);
  } catch (error) {
    return res.sendStatus(400);
  }

  return res.json({ result });
});

module.exports = router;
