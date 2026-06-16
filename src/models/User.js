import { Schema, model, models } from "mongoose";


const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String
    },
    role:{
        type:String,
        enum:["admin","superAdmin"],
        default:"admin",
        index:true
    },    
    isActive:{
        type:Boolean,
        default:true
    },
     // OTP fields
    otp:{
        type:String,
        default:null
    },

    otpExpiry:{
        type:Date,
        default:null
    },
    otpRequestedAt:{
        type:Date,
        default:null
    },

    // Reset token fields
    resetToken:{
        type:String,
        default:null
    },

    resetTokenExpiry:{
        type:Date,
        default:null
    }

   
},{timestamps:true});

const User = models.User || model("User",userSchema);

export default User;