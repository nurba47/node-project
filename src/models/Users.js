import mongoose from "mongoose";
import { randomBytes, pbkdf2Sync } from "crypto";
import { sign } from "jsonwebtoken";

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: String,
  hash: String,
  salt: String
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = randomBytes(16).toString("hex");
  this.hash = pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    },
    "secret"
  );
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT()
  };
};

mongoose.model("Users", UsersSchema);
