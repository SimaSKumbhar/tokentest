const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require ('jsonwebtoken')
const cookieParser = require ('cookie-parser')

const app = express();

app.use(express.json());
// app.use(cors({
//   origin:["http://localhost:5173"],
//   methods:["GET","POST"],
//   credentials:true,
// }));
app.use(cors());
app.use(cookieParser())

mongoose.connect("mongodb+srv://sima:sima@cluster0.yojpppf.mongodb.net/?retryWrites=true&w=majority");

const verifyUser=(req,res,next)=>{
  const token=req.cookies.token;
  if(!token){
    return res.json("the token was not available")
  }else{
    jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
      if(err) return res.json("token is wrong")
      next();
    })
  }
}


app.get('/home',verifyUser,(req,res)=>{
return res.json("Success")
})

app.get('/',(req,res)=>{
  UserModel.find()
  .then(users=>res.json(users))
  .catch(err=>res.json(err))
})
//start here

app.post('/login',(req,res)=>{
  const {email,password}=req.body;
  UserModel.findOne({email:email})
  .then(user =>{
    if(user){
      bcrypt.compare(password,user.password,(err,response)=>{
        if(response){
          const token = jwt.sign({email:user.email},"jwt-secret-key",{expiresIn:"5d"})
          res.cookie("token",token);
          res.json("Success")
        } else {
          res.json("the password is incorrect")
       
        }
      })
    }else{
      res.json("No record existed")
    }
  })

})
//end here
app.post("/register", (req, res) => {
  const { name, dob, email, password } = req.body;
  bcrypt.hash(password, 10)
  .then((hash) => {
      UserModel.create({name, dob, email, password:hash})
      .then((users) => res.json(users))
      .catch((err) => res.json(err));
  }).catch(err => console.log(err.message))
});

app.listen(3001, () => {
  console.log("server is running");
});
