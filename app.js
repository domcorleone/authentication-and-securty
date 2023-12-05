//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import encrypt from "mongoose-encryption"; //level 2
import "dotenv/config"; // Add Environment Variables
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
let message = "";
const url = "mongodb://127.0.0.1:27017";
const dbname = "testedb";
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/* recommended way to declare a schema  */
const userSchema = new Schema({
  email: String,
  password: String,
}); // schema //level 2

const User = new mongoose.model("User", userSchema); // model

async function openConnection() {
  console.log("openConnection");
  try {
    await mongoose.connect(url.concat("/").concat(dbname));
  } catch (err) {
    console.error(err);
  }
}

openConnection();

async function listAllUsers() {
  try {
    console.log(User);
    let result = await User.find();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

app.get("/", async (req, res) => {
  //   const con = await openConn();
  await listAllUsers();
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    if (err) {
      console.error(err);
    } else {
      newUser.save();
      res.render("secrets.ejs");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({ email: req.body.username });
  
  if (user) { // means that user exists    
   
    bcrypt.compare(req.body.password, user.password /*hash*/, (err, result) => {
      if (err) {
        console.error("Error occured while trying to check passwords");
      } else if (result === true) {
        res.render("secrets.ejs");
      } else {
        message = `Password for Username ${req.body.username} doesn't match.`;
        res.render("login.ejs", { error: message });
      }
    });
  } else {
    message = `Username ${req.body.username} doesn't exist.`;
    res.render("login.ejs", { error: message });
  }
});

app.get("/submit", (req, res) => {
  res.render("submit.ejs");
});

app.get("/logout", (req, res) => {
  message = "";
  res.render("login.ejs");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
