const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlacklistModel = require("../models/blackList.model");

/*
* - user register controller
* - post/api/auth/register
*/
const userRegisterController = async (req, res)=>{
    const {name,email,password} = req.body;

    const findUser = await userModel.findOne({
        $or:[{name},{email}]
    })

    if(findUser){
        return res.status(422).json({
            message:"user already exixts",
            status:"failed"
        })
    }
    const user = await userModel.create({
        email,
        name,
        password
    })
    const token = jwt.sign({_id:user._id},process.env.SECRET_KEY,{expiresIn:"3d"});

    res.cookie("token",token);
        await emailService.sendRegistrationEmail(user.email,user.name);
    return res.status(201).json({
        message:"user created successfully",
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
            
        }
    })
}

/*
* - user login controller
* - post/api/auth/login
*/

const userLoginController = async (req,res)=>{
    const {email , password , name} = req.body;
   
    const findUser = await userModel.findOne({
        $or:[{email},{name}]
   }).select("+password");
   // to enable the findUser password select use here.as in schema it is disable.
    if(!findUser){
        return res.status(401).json({
            message:"cannot get user",
            status:"failed"
        })
    }

    const isValidPassword = await findUser.comparePassword(password);

    if(!isValidPassword){
        return res.status(401).json({
            message:"user is not valid"
        })
    }

    const token = jwt.sign({_id:findUser._id},process.env.SECRET_KEY,{expiresIn:"3d"});

    res.cookie("token",token);

    return res.status(200).json({
        message:"user successfully login",
        user:{
            _id:findUser._id,
            name:findUser.name,
            email:findUser.email
        }
    })
}

/*
* - user logout controller
* - post/api/auth/logout
*/

const userLogoutController = async (req,res)=>{
    try{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(400).json({
            message:"user alredy loggedout"
        })
    }
    //clear token..
    res.clearCookie("token");

    await tokenBlacklistModel.create({
        token:token
    })

   return res.status(200).json({
        message:"user logged out successfully"
    })
}catch(err){
    return res.status(500).json({
        message:err.message
    })
}

}

module.exports = {userRegisterController,userLoginController,userLogoutController}