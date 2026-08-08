const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model");

const accountSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:[true,"account must be associated with a user"],
        index:true //for fast searching.
    },
    status:{
        type:String,
        enum:{
        values:["Active","Frozen","Closed"],
        message:"Status can be either Active or Frozen or Closed"
        },
        default:"Active"
    },
    currency:{
        type:String,
        required:[true,"currency is required for creating an account"],
        default:"INR"
    }
},{
    timestamps:true
})

//creating a compounding index.for search account on besis of id and status both.

accountSchema.index({user:1,status:1});

//aggrigation pipeline for finding the total balance of user account.
accountSchema.methods.getBalance = async function(){
    //perticular account balance calculate.
    const balanceData = await ledgerModel.aggregate([
        {$match: {account:this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum: {
                        $cond:[
                            {$eq:["$type","Debit"]},"$amount",0
                        ]
                    }
                },
                totalCredit:{
                    $sum: {
                        $cond:[
                            {$eq:["$type","Credit"]},"$amount",0
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{$subtract:["$totalCredit","$totalDebit"]}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0;
    }
    return balanceData[0].balance;
}

const accountModel = mongoose.model("account",accountSchema);

module.exports = accountModel;