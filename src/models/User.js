import { Schema, Types, model, models } from "mongoose";


const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["admin","user"],
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