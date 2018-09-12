const mongoose = require("mongoose");
const usersData = require("../data");
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
const Rewards = mongoose.model("Rewards");

async function findUser(query) {
  return await Users.findOne(query);
}

async function find(model, query, fields) {
  let docs = await model.find(query, fields);
  console.log("find", JSON.stringify(docs));
}

async function insertDrug(drug) {
  try {
    const res = await new Drugs(drug).save();
    // console.log("save", res);
  } catch (error) {
    console.log(error.message);
  }
}

async function insertMany(model, docs) {
  try {
    const res = await model.insertMany(docs);
    console.log("insertMany", res);
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

async function updateOne(model, condition, values) {
  try {
    let res = await model.findOneAndUpdate(condition, values);
    console.log("updateOne", res)
  } catch (error) {
    console.log(error);
  }
}

// updateOne(Users, {email: "арзыматова зарина"}, {email: "Арзыматова Зарина"});

// find(Users, {email: "Арзыматова Зарина"}, { __v: 0, hash: 0, salt: 0 });

// findUser({ referralCode: 1 }).then(async user => {
//   let children = await user.getChildren();
//   console.log("CHILDREN", children);
// });

// find(Drugs, {});

// remove(Users, { email: { $ne: "admin@gmail.com" } });
// remove(Drugs);

// insertUser({
//   user: {
//     email: "admin@gmail.com",
//     password: "12345678",
//     referralCode: "0"
//   }
// });

// insertMany(Users, usersData)

// drugs.forEach(d => insertDrug(d));
