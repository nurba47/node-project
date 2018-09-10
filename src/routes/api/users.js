const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");
const Users = mongoose.model("Users");

//POST new user route (optional, everyone has access)
router.post("/", auth.optional, (req, res, next) => {
  const {
    body: { user }
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    });
  }

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
router.post("/login", auth.optional, (req, res, next) => {
  const {
    body: { user }
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    });
  }

  return passport.authenticate("local", { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return res.status(400).send(info);
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.post("/tree", auth.required, async (req, res, next) => {
  const {
    payload: { id },
    body: { childId }
  } = req;

  try {
    let user = await Users.findById(id);
    if (!user) return res.sendStatus(400);

    if (childId) {
      let child = await Users.findById(childId);
      if (child) {
        return child
          .getChildren()
          .then(children => res.json({ children }))
          .catch(() => {});
      } else return res.sendStatus(400);
    } else {
      return user
        .getChildren()
        .then(children => res.json({ children }))
        .catch(() => {});
    }
  } catch (error) {
    return res.sendStatus(400);
  }
});

module.exports = router;

/* return Users.findById(id).then(user => {
  if (!user) {
    return res.sendStatus(400);
  }
  if (childId) {
    user = await Users.findById(childId);
    if (user) {
      user
        .getChildren()
        .then(children => {
          return res.json({ children });
        })
        .catch(() => {});
    } else return res.json({ children });
  } else {
    user
      .getChildren()
      .then(children => res.json({ children }))
      .catch(() => {});
  }
}); */
