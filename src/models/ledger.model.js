const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"ledger mustbe associated with an account"],
    index:true,
    immutable:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating a ledger"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["Credit","Debit"],
            message:"type can be either Credit or Debit"
        },
        required:[true,"type is required for creating a ledger"],
        immutable:true
    }
})

// in futue it cannot be modified or deleted. so we create a funcction for creating a ledger.

const preventLedgerModification = function(){
    throw new Error("Ledger cannot be modified or deleted");
}

ledgerSchema.pre("updateOne",preventLedgerModification);
ledgerSchema.pre("deleteOne",preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification);
ledgerSchema.pre("findOneAndDelete",preventLedgerModification);
ledgerSchema.pre("updateMany",preventLedgerModification);
ledgerSchema.pre("deleteMany",preventLedgerModification);
ledgerSchema.pre("findOneAndRemove",preventLedgerModification);
ledgerSchema.pre("remove",preventLedgerModification);
ledgerSchema.pre("findOneAndReplace",preventLedgerModification);

const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel;