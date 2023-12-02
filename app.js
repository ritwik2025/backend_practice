require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser=require('cookie-parser')
const auth=require('./middleware/auth')
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Hello from authentication system</h1>");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).send("User already exists");
    }

    const myEncPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: myEncPassword,
    });

    //token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    //update in database ur choice

    //handle password we cannot send encrypted password
    user.password=undefined;
    res.status(201).json(user);
  } 
  catch (error) {
    console.log(error);
  }
});

app.post('/login',async(req,res)=>{
  try{
    const {email,password}=req.body;

    if(!(email&& password)){
      res.status(400).send("Field is missing")
    }

    const user=await User.findOne({email})

    if(user &&(await bcrypt.compare(password,user.password))){
      const token=jwt.sign(
        {user_id:user._id,email_id:email,password,firstname:user.firstname},
        process.env.SECRET_KEY,
        {
          expiresIn:"2h"
        }
      )

      user.token=token;
      user.password=undefined;
      //res.status(200).json(user); we are commenting it for implementing cookie


      //if u want to use cookies

      const options={
        expires:new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
      }

      res.status(200).cookie('token',token,options).json({
        success:true,
        token,
        user
      })

    }

    res.send(400).send("email or password is incorrect");
    

  }catch(error){
    console.log(error);
  }
})

app.get('/dashboard',auth,(req,res)=>{
  res.send('Welcome to secret information');
})

module.exports = app; //This App.js get so big so it is better to export the app and listen at some other place
