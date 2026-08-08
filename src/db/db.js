const mongoose = require("mongoose");

const connectDB = async ()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("server is connected to DB.")
    })
    }catch(err){
        console.log("error comming to db",err);
        process.exit(1);
    }
}

module.exports = connectDB;