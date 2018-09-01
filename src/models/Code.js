const mongoose = require("mongoose");
const { Schema } = mongoose;

const Code = new Schema({
  code: { type: String, required: true, dropDups: true, unique: true },
  lastValue: { type: Number, required: true }
});

mongoose.model("Codes", Code);
