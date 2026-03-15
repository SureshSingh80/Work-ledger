import { Schema, Types, model, models } from "mongoose";


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
        default:"user",
        index:true
    },    
    isActive:{
        type:Boolean,
        default:true
    },

   
},{timestamps:true});

const User = models.User || model("User",userSchema);

export default User;