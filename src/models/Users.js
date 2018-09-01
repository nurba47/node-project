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
    lowercase: true,
    trim: true,
    dropDups: true,
    unique: true
  },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  parentCode: {
    type: String,
    required: true,
    validate: {
      validator: function(parentCode) {
        let UserModel = this.model("Users");
        return new Promise(resolve => {
          UserModel.findOne({ referralCode: parentCode }).then(user => {
            return resolve(user !== null);
          });
        });
      },
      msg: props => `${props.value} is not a valid!`
    }
  },
  referralCode: {
    type: String,
    dropDups: true,
    unique: true
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

UsersSchema.pre("save", async function(next) {
  const prefix = generatePrefix();
  const Codes = mongoose.model("Codes");

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
});

mongoose.model("Users", UsersSchema);
