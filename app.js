//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import googleStrategy from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";
import "dotenv/config";

const app = express();
const port = 3000;
let message = "";
const url = "mongodb://127.0.0.1:27017";
const dbname = "testedb";
const saltRounds = 10;
const GoogleStrategy = googleStrategy.Strategy;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
  session({
    secret: "Our little secret.", //hide this
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

async function openConnection() {
  console.log("openConnection");
  try {
    await mongoose.connect(url.concat("/").concat(dbname));
  } catch (err) {
    console.error(err);
  }
}

openConnection();

/* recommended way to declare a schema  */
const userSchema = new Schema({
  username: String,
  password: String,
  googleId: String,
}); // schema

userSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema); // model

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  console.log(user)
  process.nextTick(function() {
    return cb(null, {
      id: user.id,    
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    // console.log(user)
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      //https://www.passportjs.org/packages/passport-google-oauth20/
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile)
      User.findOrCreate({ googleId: profile.id }, (err, user) => {
        //https://www.npmjs.com/package/mongoose-findorcreate
        
        return cb(err, user);
      });
    }
  )
);

async function listAllUsers() {
  try {
    console.log(User);
    let result = await User.find();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/", async (req, res) => {
  res.render("home.ejs");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", (req, res) => {
  //https://www.npmjs.com/package/passport-local-mongoose
  console.log(req.body);
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        res.redirect("/register");
      } else {
        console.log(user);
        passport.authenticate("local")(req, res, () => {
          // will create a session with a cookie
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => { //https://www.passportjs.org/concepts/authentication/login/
  
  console.log(req.body);
  const user = new User({
    // coming from the webpage
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      message = `Username ${req.body.username} or password is invalid.`;
      res.render("login.ejs", { error: message });
    } else {
      passport.authenticate("local")(req, res, () => {
        // this will call login() method automatically
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/submit", (req, res) => {
  res.render("submit.ejs");
});

app.get("/logout", (req, res) => {
  //https://www.passportjs.org/tutorials/password/logout/
  message = "";
  req.logout(function (err) {
    // will delete a session with the cookie
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
//