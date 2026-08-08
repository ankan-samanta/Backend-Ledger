const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required for blacklisting"],
        unique:[true,"token is already blacklisted"]
    }
},{
    timestamps:true
})

tokenBlacklistSchema.index({createdAt:1},{
    expireAfterSeconds: 60 * 60 * 24 * 3 //token will be automatically removed from blacklist after 24 hours.
})

const tokenBlacklistModel = mongoose.model("tokenBlacklist",tokenBlacklistSchema);
module.exports = tokenBlacklistModel;