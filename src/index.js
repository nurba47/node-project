import express from "express";
import { join } from "path";
import { urlencoded, json } from "body-parser";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "errorhandler";
import dotenv from "dotenv";

dotenv.load();

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === "production";

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(require("morgan")("dev"));
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(express.static(join(__dirname, "public")));
app.use(
  session({
    secret: "passport-tutorial",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

if (!isProduction) {
  app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect(
  "mongodb://localhost/nodejs-project",
  { useNewUrlParser: true }
);
mongoose.set("debug", true);

import "./models/Users";
import "./config/passport";
app.use(require("./routes").default);

//Error handlers & middlewares
if (!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
