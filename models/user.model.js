import mongoose from "mongoose";
const userSchema =mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true

    },
    password:{
        type:String,
        selected:false,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    address:{
        type:String,
    },
    phone:{
        type:String,
        selected:false

    },
    profileImage:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    paymentMethods:{
        bankTransfer:{
            bankAccountNumber:String,
            bankAccountName:String,
            bankName:String,
            
        }
    },
    paypal:{
        paypalEmail:String,

    },
    role:{
        type:String,
        enum:["Auctioneer","Bidder","Super Admin"]
    },
    unpaidCommission:{
        type:Number,
        default:0,
    },
    auctionsWon:{
        type:Number,
        default:0,
    },
    moneySpent:{
        type:Number,
        default:0,
    },
    
    token:{
        type: String,
    },
    confirmed:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    }
});
const User=mongoose.model('User',userSchema);
export default User;