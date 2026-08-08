const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blackList.model");

const authMiddleware = async (req,res,next)=>{
    //get element form authentication header or cookies.
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if(!token){
        return res.status(401).json({
            message:"unauthorized access or token is missing"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        
        const user = await userModel.findById({_id:decoded._id})

        req.user = user;
        return next();

    }catch(err){
        return res.status(401).json({
            message:"unauthorizd access, token is invalid"
        })
    }

}

const authSystemUserMiddleware = async (req,res,next)=>{

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"unauthorized access or token is missing"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.SECRET_KEY);

        //select also systemUser.
        const user = await userModel.findById({
            _id:decoded._id
        }).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message:"forbidden access not a System user."
            })

        }

        req.user = user;
        return next();


    }catch(err){
        return res.status(401).json({
            message:"unauthorized access,token is invalid"
        })
    }
}

module.exports = {authMiddleware,authSystemUserMiddleware};