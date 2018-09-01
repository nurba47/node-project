const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { codeGenerator } = require("../utils/helpers");
dotenv.load();

const SECRET = process.env.SECRET || "secret";

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    dropDups: true,
    unique: true,
    index: true
  },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  parentCode: { type: String, required: true },
  referralCode: {
    type: String,
    required: true,
    dropDups: true,
    unique: true,
    index: true
  }
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
    parentCode: this.parentCode,
    token: this.generateJWT()
  };
};

UsersSchema.pre("save", function(next) {
  this.referralCode = codeGenerator(7);
  next();
});

mongoose.model("Users", UsersSchema);
