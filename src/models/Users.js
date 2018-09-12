const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { generatePrefix, generateCode } = require("../utils/helpers");

const dotenv = require("dotenv");
dotenv.load();

const SECRET = process.env.SECRET || "secret";

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: {
    type: String,
    required: true,
    // lowercase: true,
    trim: true,
    dropDups: true,
    unique: true
  },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  parent: { type: String, ref: "Users" },
  children: [{ type: String, ref: "Users" }],
  referralCode: {
    type: String,
    dropDups: true,
    unique: true
  },
  level: Number
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    { email: this.email, id: this._id, exp: parseInt(expirationDate.getTime() / 1000, 10) },
    SECRET
  );
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    referralCode: this.referralCode,
    token: this.generateJWT(),
    isAdmin: this._id === process.env.ADMIN_ID
  };
};

UsersSchema.methods.getChildren = async function() {
  const UserModel = this.model("Users");
  let children = await UserModel.find(
    { referralCode: { $in: this.children } },
    { _id: 0, __v: 0, hash: 0, salt: 0 }
  );
  var stack = [];
  stack.push(...children);
  while (stack.length > 0) {
    var currentNode = stack.pop();
    if (currentNode.children.length) {
      var grandChildren = await currentNode.getChildren();
      currentNode.children = grandChildren;
    }
  }
  return children;
};

UsersSchema.pre("save", async function(next) {
  // find parent then assign ancestors and level
  const Users = this.model("Users");
  let parent = await Users.findOne({ referralCode: this.referralCode });
  if (!parent) {
    next(new Error(`invalid ref ${this.referralCode}`));
  }
  this.parent = parent.referralCode;
  this.level = parent.level + 1;

  // now generate referralCode for this user
  const Codes = this.model("Codes");
  const prefix = generatePrefix();

  let found = await Codes.findOne({ code: prefix });
  let number = found ? found.lastValue + 1 : 1;
  let code = generateCode(prefix, number);
  this.referralCode = code;
  try {
    if (found) {
      await Codes.findByIdAndUpdate(found._id, { $set: { lastValue: number } });
    } else await new Codes({ code: prefix, lastValue: number }).save();
    next();
  } catch (error) {
    next(error);
  }
  next();
});

UsersSchema.post("save", async function() {
  const Users = this.model("Users");
  let parent = await Users.findOne({ referralCode: this.parent });

  await Users.findByIdAndUpdate(parent._id, {
    $set: { children: [...parent.children, this.referralCode] }
  });
});

mongoose.model("Users", UsersSchema);
