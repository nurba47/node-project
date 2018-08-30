const mongoose = require("mongoose");
const drugs = require("../data");
const dotenv = require("dotenv");
dotenv.load();

//Configure Mongoose
mongoose.promise = global.Promise;

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true }
);
mongoose.set("debug", true);

require("./models");

const Users = mongoose.model("Users");
const Drugs = mongoose.model("Drugs");

async function find(model, query, fields) {
  let docs = await model.find(query, fields).count();
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

async function insertUser(user) {
  try {
    const res = await new Users(user).save();
    console.log("save", res);
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

find(Users, {}, { email: 1 });
// find(Drugs, {});

// remove(Users);
// remove(Drugs);

// insertUser({
//   user: {
//     email: "admin@gmail.com",
//     password: "12345678",
//     referralCode: "0"
//   }
// });
// drugs.forEach(d => insertDrug(d));
