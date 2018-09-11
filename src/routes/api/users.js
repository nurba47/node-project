const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");
const Users = mongoose.model("Users");
const { validateAuthParams, validateUser } = require("../validators");

//POST new user route (optional, everyone has access)
router.post("/", validateAuthParams, (req, res, next) => {
  const { user } = req.body;

  if (!user.referralCode) {
    return res.status(422).json({ errors: { referralCode: "is required" } });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser
    .save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }))
    .catch(err => res.status(422).json({ error: { message: err.message } }));
});

//POST login route (optional, everyone has access)
router.post("/login", validateAuthParams, (req, res, next) => {
  return passport.authenticate("local", { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      return res.json({ user: passportUser.toAuthJSON() });
    }

    return res.status(400).send(info);
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.post("/tree", auth.required, validateUser, async (req, res, next) => {
  const { user } = req.payload;

  try {
    return user
      .getChildren()
      .then(children => res.json({ children }))
      .catch(() => {});
  } catch (error) {
    return res.sendStatus(400);
  }
});

module.exports = router;
