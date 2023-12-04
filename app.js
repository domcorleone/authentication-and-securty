//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;
let message = "";
const url = "mongodb://127.0.0.1:27017";
const dbname = "testedb";

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/* simple way to declare a schema - javascript object */
const userSchema = { 
  email: String, 
  password: String 
}; // schema



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
    console.log(User)
    let result = await User.find();
    console.log(result);
  } catch (error) { console.error(error)}
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
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save();  
  res.render("secrets.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  console.log(req.body);  
  let user = await User.findOne({ email: req.body.username});
  console.log("user", user);
  if (user){ // means that user exists    
    console.log("password", user.password);
    if ( user.password === req.body.password ){ // if password matches
      res.render("secrets.ejs");
    } else{ 
      message = `Password for Username ${req.body.username} doesn't match.`;      
      res.render("login.ejs",{error: message } ); }
  } else {
    message = `Username ${req.body.username} doesn't exist.`;    
    res.render("login.ejs", {error: message });}
  
});

app.get("/submit", (req, res) =>{
  res.render("submit.ejs");
})

app.get("/logout", (req, res)=>{
  message = "";
  res.render("login.ejs");
})

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
