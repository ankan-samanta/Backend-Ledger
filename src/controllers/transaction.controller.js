const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * - create a new transaction.
 * - the 10 step transaction flow
 *   1 -validate the request body
 *   2 - validate idempotency key
 *   3 - check account status
 *   4 - drive sender balance from ledger
 *   5 - create transaction(pending) 
 *   6 - create debit ledger for sender
 *   7. create credit ledger for receiver
 *   8. mark transaction as completed
 *   9. commit mongoDB session
 *   10. send email notification to sender and receiver
 */

const createTransaction = async (req,res)=>{
    const {fromAccount , toAccount,amount,idempotencyKey} = req.body;

    /**
     *  1.- validate request.
     */

    //if not comes theses fields then..
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
       return res.status(400).json({
            message:"fromAccount,toAccount,amount and idempotency key are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(401).json({message:"invalid fromAccount or toAccount"});
    }

    /**
     * 2- validate isempotency key
     */ //use for as same payment two times not occur

     const isTransactionAlreadyExixts = await transactionModel.findOne({
        idempotencyKey:idempotencyKey
     }) 

     if(isTransactionAlreadyExixts){
        if(isTransactionAlreadyExixts.status === "completed"){
            return res.status(200).json({message:"transaction already exixts",
            transaction:isTransactionAlreadyExixts
            });
        }
        if(isTransactionAlreadyExixts.status === "pending"){
            return res.status(200).json({
                message:"transaction is still processing"
            })
        }
        if(isTransactionAlreadyExixts.status === "failed"){
           return res.status(400).json({
                message:"transaction processing failed"
            })
        }
        if(isTransactionAlreadyExixts.status === "reversed"){
           return res.status(500).json({
                message:"please try again"
            })
        }
     }
     /**
      * 3. Chacked account status..
      */
      if(fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"){
        return res.status(400).json({
            message:"both account must be active to process transaction"
        })
      }

      /**
       * 4.Derive sender balance from ledger.
       */
        //apply getBalance method on it.
        const balance = await fromUserAccount.getBalance();

        if(balance<amount){
            return res.status(400).json({
                message:`insufficient balance.current balance is ${balance}.Requested amount is ${amount}`
            })
        }
/**
 * 5.Create transaction(pending)
 */
let updatedTransaction;
try{
const session = await mongoose.startSession();
//create as after it all function fully compleated or neither be done ...not like 2 step done other not.
session.startTransaction();

const transaction = (await transactionModel.create ([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status:"pending"
}],{session}))[0]

const debitLedgerEntry = await ledgerModel.create([{
    account:fromAccount,
    amount:amount,
    transaction:transaction._id,
    type:"Debit"
}],{session})

//if transaction fail then..
   await (()=>{
    return new Promise((resolve)=> setTimeout(resolve,15*1000));
   })()


const creditLedgerEntry = await ledgerModel.create([{
    account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"Credit"
}],{session})

//status changed
updatedTransaction = await transactionModel.findOneAndUpdate({_id:transaction._id},{status:"completed"},{session,new:true});

//end session.
await session.commitTransaction()
session.endSession();
}catch(err){
   return res.status(500).json({
        message:"transaction is on the way so retry after a few time."
    })
}

/**
 * 10.send email notification here.
 */

    await emailService.sendTransactionEmail(req.user.email, req.user.name,amount,toAccount)

    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:updatedTransaction
    })

}

const createInitialFundsTransaction = async (req,res)=>{
    const {toAccount,amount,idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount,amount and idempotency key are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user:req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message:"system user account not found"
        })
    }

    //validate itempotancy key..
    const existingTransaction = await transactionModel.findOne({
    idempotencyKey
});

if (existingTransaction) {
    return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction
    });
}

    //transaction initiate...
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"pending"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"Debit"
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"Credit"
    }],{session})

    transaction.status = "completed"
    await transaction.save({session})

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message:"initial funds transaction compleated successful",
        transaction:transaction
    })
}

module.exports = {
    createTransaction,createInitialFundsTransaction
}

