const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const userModel = require("./model/userModel");
const bcrypt = require("bcrypt");
const salt = 10;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const mongodb = () => {
  mongoose
    .connect("mongodb://localhost:27017/authentication_practice")
    .then(() => {
      console.log("Server connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error in conecting MongoDB", err);
    });
};
mongodb();

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", async (req, res) => {
  const { username, email, password, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    res.send("User already exists");
  } else {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        await userModel.create({
          username,
          email,
          password: hash,
          age,
        });
      }
    });
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let password_db;
  let user = await userModel.findOne({ email });
  if (!user) {
    res.send("User not exists");
  } else {
    password_db = user.password;
    const result = await bcrypt.compare(password, password_db);
    if (result) {
      const token = jwt.sign({ email: user.email }, "secret");
      res.cookie("token", token);
      res.send("Login Success");
    } else {
      res.send("Password Incorrect");
    }
  }
});

app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/")
})

app.listen(3000, () => {
  console.log("Server run at http://localhost:3000");
});
