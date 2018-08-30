const mongoose = require("mongoose");

const { Schema } = mongoose;

const DrugsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

mongoose.model("Drugs", DrugsSchema);
