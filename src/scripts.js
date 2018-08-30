const mongoose = require("mongoose");
const drugs = require("../data");

//Configure Mongoose
mongoose.promise = global.Promise;

mongoose.connect(
  "mongodb://localhost/nodejs-project",
  { useNewUrlParser: true }
);
mongoose.set("debug", true);

require("./models");

const Users = mongoose.model("Users");
const Drugs = mongoose.model("Drugs");

async function find(model, query, fields) {
  let docs = await model.find(query, fields);
  console.log("find", docs);
}

async function insertDrug(drug) {
  try {
    const res = await new Drugs(drug).save();
    // console.log("save", res);
  } catch (error) {
    console.log(error.message);
  }
}

async function remove(model, condition) {
  try {
    let docs = await model.deleteMany(condition);
    console.log("remove", docs);
  } catch (error) {
    console.log(error.message);
  }
}

// find(Users, {}, { email: 1 });

// find(Drugs);
// remove(Drugs);
// drugs.forEach(d => insertDrug(d));
