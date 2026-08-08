const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required for creating an account"],
        unique:[true,"name is alredy exixts"],

    },
    email:{
        type:String,
        required:[true,"email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
        unique:[true,"email already exixts"]
    },
    password:{
        type:String,
        required:[true,"password is required for the creating account"],
        minlength:[6,"password should be morethan 6 char"],
        select:false //means in every quary it should be unfactched.
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    //user creation date comes.
    timestamps:true
})
//check before user data savings.if user password changed then hashed it.other wise leave it.

userSchema.pre("save",async function(){

    if(!this.isModified("password")){
        return next();
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash

    return ;
})

//compairing the password for verifying.

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);

}

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;
