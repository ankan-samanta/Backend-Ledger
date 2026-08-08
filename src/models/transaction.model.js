const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associate with a from account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associate with a to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["pending","completed","failed","reversed"],
            message:"status can either panding,completed,failed or reversed"
        },
        default:"pending"
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating a transaction"],
        min:[0,"transaction cannot be nagative"],
    },
    idempotencyKey:{ //besically it prevent two transaction on a similar transaction period for same idempotency key.
        type:String,
        required:[true,"idempotency key is required for creating a transaction"],
        index:true,
        unique:true
    }
},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema);

module.exports = transactionModel;