const mongoose = require("mongoose");
const Users = mongoose.model("Users");

exports.validateAuthParams = async (req, res, next) => {
  const { user } = req.body;

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
  next();
};

exports.validateUser = async (req, res, next) => {
  const { user } = req.payload;

  let user = await Users.findById(id);
  if (!user) return res.sendStatus(400);

  req.payload.user = user;
  next();
};

exports.isAdmin = async (req, res, next) => {
  const { user } = req.payload;
  // TODO: CHECK IF USER IS ADMIN
  if (!user.isAdmin) res.sendStatus(401);

  next();
};
