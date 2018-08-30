const mongoose = require("mongoose");
const router = require("express").Router();
const Drugs = mongoose.model("Drugs");
const auth = require("../auth");

router.get("/", auth.optional, (req, res, next) => {
  Drugs.find({}, { description: 0, __v: 0 })
    .then(drugs => res.json({ drugs }))
    .catch();
});

router.get("/:id", auth.optional, async (req, res, next) => {
  const id = req.params.id;
  let data = {};
  try {
    let drug = await Drugs.findOne({ _id: id }, { __v: 0 });
    data = { drug };
  } catch (error) {
    data = { error: { message: "Drug not found" } };
    res.status(422);
  }

  res.json(data);
});

module.exports = router;
