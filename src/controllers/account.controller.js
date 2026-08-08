const accountModel = require("../models/account.model");

const createAccount = async (req,res)=>{
    //account creation.
    const account =await accountModel.create({
        user: req.user._id
    })

    res.status(201).json({
        message:"account created successfully",
        account
    })
}

const getUserAccount = async (req,res)=>{
    const accounts = await accountModel.findOne({user:req.user._id});

    if(!accounts){
        return res.status(400).json({
            message:"no account present here"
        })
    }

    return res.status(200).json({
        message:"accounts fetched successfully",
        accounts
    })
}

const getAccountBalance = async (req,res)=>{
    const accountId = req.params.accountId;

    const account = await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
       return res.status(400).json({
            message: "account not found"
        })
    }

    const balance = await account.getBalance();

    return res.status(200).json({
        message:"balance successfully fatched",
        accountId:accountId,
        balance:balance
    })

}

module.exports = {
    createAccount,getUserAccount,getAccountBalance
}
